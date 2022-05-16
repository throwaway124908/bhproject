using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Data;
using System.Data.Common;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Data.Sqlite;
using EFModels;
public sealed class DatabaseContext : DbContext
{
    //SemaphoreSlim doesn't have thread affinity, so a thread can acquire the semaphore and another one can release it
    //see https://docs.microsoft.com/en-us/dotnet/standard/threading/overview-of-synchronization-primitives#semaphore-and-semaphoreslim-classes
    private static readonly SemaphoreSlim SemLock = new(1, 1);
    private readonly Stopwatch ConnectionTimer = new();
    private static class ConnectionStringContainer
    {
        private static volatile string? connString;
        private static readonly object locker = new();
        public static string GetConnectionString() { return connString ?? throw new Exception("connection string hasn't been set yet"); }
        public static void SetConnectionString(string newStr)
        {
            lock (locker)
            {
                if (string.IsNullOrWhiteSpace(newStr)) { throw new Exception("cannot use an empty connection string"); }
                connString = newStr;
            }
        }
    }
    public static void SetConnectionString(string Str) { ConnectionStringContainer.SetConnectionString(Str); }
    public readonly DbConnection Connection;
    private IDbContextTransaction? GlobalContextTransaction;
    private DbTransaction? GlobalTransaction;
    private readonly IsolationLevel _isolationLevel;
    private bool LockAcquired;
    private void TryAcquireLock()
    {
        if (!LockAcquired && _isolationLevel != IsolationLevel.ReadUncommitted)
        {
            LockAcquired = true;
            SemLock.Wait();
        }
    }
    private void TryReleaseLock() { if (LockAcquired) { SemLock.Release(); } }
    public DatabaseContext(IsolationLevel TransactionIsolation = IsolationLevel.Serializable, bool StartTransaction = true)
    {
        _isolationLevel = TransactionIsolation;
        TryAcquireLock();
        //make sure to release the semlock if an error occurs in the constructor
        try
        {
            Console.WriteLine(">>>>>>>>>>>>>>>>>>>>>>>>>>> Started DB");
            ConnectionTimer.Restart();
            Connection = new SqliteConnection(ConnectionStringContainer.GetConnectionString());
            Database.OpenConnection();
            if (StartTransaction) { this.StartTransaction(); }
        }
        catch { Dispose(); throw; }
    }
    protected override void OnConfiguring(DbContextOptionsBuilder Builder)
    {
        //see https://stackoverflow.com/questions/26324926/why-a-member-method-of-class-is-called-before-the-constructor
        if (!Builder.IsConfigured)
        {
            Builder.UseSqlite(Connection, delegate (SqliteDbContextOptionsBuilder SqliteOptions) { });
            //Builder.EnableSensitiveDataLogging();
            Builder.UseLazyLoadingProxies();
        }
    }
    //###############################################################################
    //###############################################################################
    public void StartTransaction()
    {
        if (GlobalContextTransaction != null) { throw new Exception("transaction already started"); }
        TryAcquireLock();
        GlobalContextTransaction = Database.BeginTransaction(_isolationLevel);
        GlobalTransaction = GlobalContextTransaction.GetDbTransaction();
    }
    //###############################################################################
    //###############################################################################
    public DbSet<CandidateReason> CandidateReasons { get; set; } = default!;
    //###############################################################################
    //###############################################################################
    //###############################################################################
    //###############################################################################
    public bool Disposed { get; private set; }
    public override void Dispose()
    {
        if (!Disposed)
        {
            Disposed = true;
            GlobalContextTransaction?.Dispose();
            GlobalTransaction?.Dispose();
            Connection?.Dispose();
            base.Dispose();
            Console.WriteLine(">>>>>>>>>>>>>>>>>>>>>>>>>>> Disposed DB, connected for " + ConnectionTimer.Elapsed.TotalSeconds + "s");
            TryReleaseLock();
        }
    }
    public async Task CommitAndDisposeAsync()
    {
        if (GlobalContextTransaction != null) { await GlobalContextTransaction.CommitAsync(); }
        Dispose();
    }
}