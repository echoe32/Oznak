import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionChart from '../components/TransactionChart';
import CategoryIcon from '../components/CategoryIcon';
import {
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
    getCurrentUser,
    logoutUser,
} from '../services/api';
import { sanitizeText } from '../utils/security';

const CATEGORY_OPTIONS = [
    { value: 'FOOD', label: 'Еда и напитки' },
    { value: 'ENTERTAINMENT', label: 'Развлечения' },
    { value: 'BILLS', label: 'Счета' },
    { value: 'TRANSPORT', label: 'Транспорт и путешествия' },
    { value: 'SHOPPING', label: 'Покупки' },
    { value: 'OTHER', label: 'Другое' },
];

const CATEGORY_LABELS = {
    FOOD: 'Еда и напитки',
    ENTERTAINMENT: 'Развлечения',
    BILLS: 'Счета',
    TRANSPORT: 'Транспорт и путешествия',
    SHOPPING: 'Покупки',
    OTHER: 'Другое'
}

function formatTxTime(createdAt) {
    if (createdAt == null) return '—';
    let d;
    if (typeof createdAt === 'string') {
        d = new Date(createdAt);
    } else if (Array.isArray(createdAt)) {
        const [y, mo, day, h = 0, min = 0, sec = 0] = createdAt;
        d = new Date(y, mo - 1, day, h, min, sec);
    } else {
        return '—';
    }
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('FOOD');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editCategory, setEditCategory] = useState('FOOD');
    const [editDescription, setEditDescription] = useState('');
    const [isUpdatingId, setIsUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const pendingDeleteTx = pendingDeleteId != null
        ? transactions.find((t) => t.id === pendingDeleteId)
        : null;

    const loadTransactions = useCallback(async () => {
        try {
            setError('');
            const data = await getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to load transactions", error);
            setError('Could not load transactions. Please log in again.');
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const me = await getCurrentUser();
                setUserEmail(me.email || '');
            } catch {
                setUserEmail('');
            }
            await loadTransactions();
        };
        init();
    }, [loadTransactions]);

    useEffect(() => {
        if (pendingDeleteId == null) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setPendingDeleteId(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [pendingDeleteId]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logoutUser();
            navigate('/', { replace: true });
        } catch (e) {
            console.error(e);
            navigate('/', { replace: true });
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setIsSaving(true);
            const safeDesc = sanitizeText(description, 500) || '—';
            await createTransaction({
                amount: parseFloat(amount),
                category,
                description: safeDesc,
            });
            setAmount('');
            setDescription('');
            await loadTransactions();
        } catch (error) {
            console.error("Неполучилось сохранить транзакцию", error);
            setError(error.message || 'Не полуичлось сохранить транзакцию. Ваша сессия истекла.');
        } finally {
            setIsSaving(false);
        }
    };

    const startEdit = (tx) => {
        setEditingId(tx.id);
        setEditAmount(String(tx.amount));
        setEditCategory(tx.category);
        setEditDescription(tx.description || '');
        setError('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditAmount('');
        setEditCategory('FOOD');
        setEditDescription('');
    };

    const handleUpdate = async (id) => {
        try {
            setError('');
            setIsUpdatingId(id);
            await updateTransaction(id, {
                amount: parseFloat(editAmount),
                category: editCategory,
                description: sanitizeText(editDescription, 500) || '—',
            });
            cancelEdit();
            await loadTransactions();
        } catch (error) {
            console.error("Не получилось обновить транзакцию.", error);
            setError(error.message || 'Не получилось обновить транзакцию.');
        } finally {
            setIsUpdatingId(null);
        }
    };

    const confirmRemoveTransaction = async () => {
        if (pendingDeleteId == null) return;
        const id = pendingDeleteId;
        try {
            setError('');
            setDeletingId(id);
            await deleteTransaction(id);
            setPendingDeleteId(null);
            if (editingId === id) cancelEdit();
            await loadTransactions();
        } catch (error) {
            console.error("Не получилось удалить транзакцию", error);
            setError(error.message || 'Не получилось удалить транзакцию.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-200 p-8 text-slate-800">
            {pendingDeleteTx && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px]"
                    role="presentation"
                    onClick={() => setPendingDeleteId(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                        className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 id="delete-dialog-title" className="text-lg font-semibold text-slate-800">
                            Удалить транзакцию?
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Это действие нельзя отменить. Следующая транзакция будет удалена:
                        </p>
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-slate-200 p-2.5 text-slate-600">
                                    <CategoryIcon category={pendingDeleteTx.category} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-700">
                                        {CATEGORY_LABELS[pendingDeleteTx.category.toUpperCase()] || pendingDeleteTx.category}
                                    </p>
                                    <p className="text-sm text-slate-600 break-words">
                                        {pendingDeleteTx.description || '—'}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 tabular-nums">
                                        <span className="font-medium text-slate-600">Создана:</span>{' '}
                                        {formatTxTime(pendingDeleteTx.createdAt)}
                                    </p>
                                </div>
                                <p className="shrink-0 font-mono text-lg font-bold text-slate-800">
                                    ₽{pendingDeleteTx.amount.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setPendingDeleteId(null)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
                            >
                                Отменить
                            </button>
                            <button
                                type="button"
                                onClick={confirmRemoveTransaction}
                                disabled={deletingId === pendingDeleteTx.id}
                                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:bg-slate-400 sm:w-auto"
                            >
                                {deletingId === pendingDeleteTx.id ? 'Удаляем…' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col gap-4 lg:flex-row lg:justify-end lg:items-start mb-8">
                    <div className="flex flex-col items-stretch gap-3 w-full lg:w-auto ml-auto">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            {userEmail && (
                                <span
                                    className="max-w-[min(100%,20rem)] truncate rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm"
                                    title={userEmail}
                                >
                                    {userEmail}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="rounded-lg border border-slate-400 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                            >
                                {isLoggingOut ? 'Выход из аккаунта...' : 'Выйти'}
                            </button>
                        </div>
                        <div className="w-full bg-white p-4 rounded-xl shadow-inner border border-slate-300 lg:text-right">
                            <span className="text-sm uppercase tracking-wider text-slate-500">Всего потрачено</span>
                            <p className="text-2xl font-mono font-bold text-emerald-600">{totalSpent.toFixed(2)}₽</p>
                        </div>
                    </div>
                </header>
                {error && <p className="mb-6 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-300">
                        <h2 className="text-xl mb-4 font-semibold">Диаграмма трат</h2>
                        <p className="text-sm text-slate-500 mb-2">Сумма по категориям · обновляется вместе с последней тратой</p>
                        <TransactionChart data={transactions} />
                    </div>

                    <div className="bg-slate-100 p-6 rounded-2xl shadow-lg border border-slate-300">
                        <h2 className="text-xl mb-4 font-semibold">Добавить транзакцию</h2>
                        <form className="space-y-4" onSubmit={handleSave}>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Сумма"
                                className="w-full p-3 rounded border"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-200 text-slate-600 rounded border border-slate-200 shrink-0">
                                    <CategoryIcon category={category} />
                                </div>
                                <select
                                    className="w-full p-3 rounded border"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <input
                                type="text"
                                placeholder="Описание"
                                className="w-full p-3 rounded border"
                                value={description}
                                maxLength={500}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <p className="text-xs text-slate-500">Время устанавливается автоматически, когда вы сохраняете транзакцию.</p>
                            <button type="submit" disabled={isSaving} className="w-full bg-slate-700 text-white p-3 rounded-lg hover:bg-slate-600 transition disabled:bg-slate-400">
                                {isSaving ? 'Сохраняем...' : 'Сохранить транзакцию'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg border border-slate-300">
                        <h2 className="text-xl mb-4 font-semibold">Недавние траты</h2>
                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">Трат еще нет. Можете добавить по кнопке.</p>
                            ) : (
                                transactions.map((tx) => (
                                    <div key={tx.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        {editingId === tx.id ? (
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:flex-wrap">
                                                <p className="w-full text-xs text-slate-500 tabular-nums">
                                                    <span className="font-medium text-slate-600">Добавлено:</span> {formatTxTime(tx.createdAt)}
                                                </p>
                                                <div className="flex-1 min-w-[140px]">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Сумма</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        className="w-full p-2 rounded border"
                                                        value={editAmount}
                                                        onChange={(e) => setEditAmount(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-[160px]">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Категория</label>
                                                    <select
                                                        className="w-full p-2 rounded border"
                                                        value={editCategory}
                                                        onChange={(e) => setEditCategory(e.target.value)}
                                                    >
                                                        {CATEGORY_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex-[2] min-w-[200px]">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Описание</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-2 rounded border"
                                                        value={editDescription}
                                                        maxLength={500}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdate(tx.id)}
                                                        disabled={isUpdatingId === tx.id}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:bg-slate-400"
                                                    >
                                                        {isUpdatingId === tx.id ? 'Сохраняем…' : 'Сохранить'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEdit}
                                                        className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                                                    >
                                                        Отменить
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    <div className="p-3 bg-slate-200 text-slate-600 rounded-full shrink-0">
                                                        <CategoryIcon category={tx.category} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-700">
                                                            {CATEGORY_LABELS[tx.category.toUpperCase()] || tx.category}
                                                        </p>
                                                        <p className="text-sm text-slate-600 break-words">{tx.description || '—'}</p>
                                                        <p className="text-xs text-slate-500 mt-1 tabular-nums">
                                                            <span className="font-medium text-slate-600">Добавлено:</span> {formatTxTime(tx.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                                                    <span className="font-mono font-bold text-slate-700 text-lg">
                                                        ₽{tx.amount.toFixed(2)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(tx)}
                                                        className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                                                    >
                                                        Изменить
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPendingDeleteId(tx.id)}
                                                        disabled={deletingId === tx.id}
                                                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:bg-slate-400"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
