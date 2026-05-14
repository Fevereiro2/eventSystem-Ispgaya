import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Mail, SendHorizonal, Users, Pencil, Trash2, Plus, RotateCcw } from 'lucide-react';
import AdminPageHero from '../components/AdminPageHero.js';
import { adminActions, adminBtnDanger, adminBtnEdit, adminBtnPrimary, adminBtnSecondary, adminError, adminField, adminFieldSpaced, adminFormGridSpaced, adminInfo, adminInput, adminLabel, adminList, adminListDesc, adminListItem, adminListMeta, adminListTitle, adminListTools, adminListTop, adminPanelForm, adminTextarea, blockText, blockTitle, } from '../../../styles/ui.js';
import { InfoCulturaApiError, createAdminNewsletter, createAdminNewsletterSubscriber, deleteAdminNewsletter, deleteAdminNewsletterSubscriber, fetchAdminNewsletterSubscribers, fetchAdminNewsletters, getStoredAccessToken, sendAdminNewsletter, updateAdminNewsletter, updateAdminNewsletterSubscriber, } from '../../../api/infoculturaApi.js';
import { formatAdminDateTime } from '../utils.js';
const initialNewsletterForm = {
    title: '',
    subject: '',
    content: '',
    status: 'draft',
};
const initialSubscriberForm = {
    email: '',
    is_active: true,
};
function NewslettersPage() {
    const token = getStoredAccessToken();
    const [newsletters, setNewsletters] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('newsletters');
    const [newsletterForm, setNewsletterForm] = useState(initialNewsletterForm);
    const [subscriberForm, setSubscriberForm] = useState(initialSubscriberForm);
    const [editingNewsletterId, setEditingNewsletterId] = useState(null);
    const [editingSubscriberId, setEditingSubscriberId] = useState(null);
    const [savingNewsletter, setSavingNewsletter] = useState(false);
    const [savingSubscriber, setSavingSubscriber] = useState(false);
    const [sendingNewsletterId, setSendingNewsletterId] = useState(null);
    const [deletingNewsletterId, setDeletingNewsletterId] = useState(null);
    const [deletingSubscriberId, setDeletingSubscriberId] = useState(null);
    const activeSubscribers = useMemo(() => subscribers.filter((subscriber) => subscriber.is_active).length, [subscribers]);
    const loadData = async () => {
        if (!token)
            return;
        setLoading(true);
        setError('');
        try {
            const [nextNewsletters, nextSubscribers] = await Promise.all([
                fetchAdminNewsletters(token, { page: 1, pageSize: 50 }),
                fetchAdminNewsletterSubscribers(token, { page: 1, pageSize: 100 }),
            ]);
            setNewsletters(nextNewsletters.items);
            setSubscribers(nextSubscribers.items);
        }
        catch (caughtError) {
            const message = caughtError instanceof InfoCulturaApiError
                ? caughtError.message
                : caughtError instanceof Error
                    ? caughtError.message
                    : 'Nao foi possivel carregar as newsletters.';
            setError(message);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void loadData();
    }, [token]);
    const resetNewsletterForm = () => {
        setNewsletterForm(initialNewsletterForm);
        setEditingNewsletterId(null);
    };
    const resetSubscriberForm = () => {
        setSubscriberForm(initialSubscriberForm);
        setEditingSubscriberId(null);
    };
    const handleNewsletterSubmit = async (event) => {
        event.preventDefault();
        if (!token)
            return;
        setSavingNewsletter(true);
        setError('');
        try {
            if (editingNewsletterId) {
                await updateAdminNewsletter(token, editingNewsletterId, newsletterForm);
            }
            else {
                await createAdminNewsletter(token, newsletterForm);
            }
            await loadData();
            resetNewsletterForm();
        }
        catch (caughtError) {
            const message = caughtError instanceof InfoCulturaApiError
                ? caughtError.message
                : caughtError instanceof Error
                    ? caughtError.message
                    : 'Nao foi possivel guardar a newsletter.';
            setError(message);
        }
        finally {
            setSavingNewsletter(false);
        }
    };
    const handleSubscriberSubmit = async (event) => {
        event.preventDefault();
        if (!token)
            return;
        setSavingSubscriber(true);
        setError('');
        try {
            if (editingSubscriberId) {
                await updateAdminNewsletterSubscriber(token, editingSubscriberId, subscriberForm);
            }
            else {
                await createAdminNewsletterSubscriber(token, subscriberForm);
            }
            await loadData();
            resetSubscriberForm();
        }
        catch (caughtError) {
            const message = caughtError instanceof InfoCulturaApiError
                ? caughtError.message
                : caughtError instanceof Error
                    ? caughtError.message
                    : 'Nao foi possivel guardar o subscritor.';
            setError(message);
        }
        finally {
            setSavingSubscriber(false);
        }
    };
    const handleEditNewsletter = (newsletter) => {
        setEditingNewsletterId(newsletter.id);
        setNewsletterForm({
            title: newsletter.title,
            subject: newsletter.subject,
            content: newsletter.content,
            status: newsletter.status,
        });
        setActiveTab('newsletters');
    };
    const handleEditSubscriber = (subscriber) => {
        setEditingSubscriberId(subscriber.id);
        setSubscriberForm({
            email: subscriber.email,
            is_active: subscriber.is_active,
        });
        setActiveTab('subscribers');
    };
    const handleDeleteNewsletter = async (id) => {
        if (!token || !window.confirm('Apagar esta newsletter?'))
            return;
        setDeletingNewsletterId(id);
        setError('');
        try {
            await deleteAdminNewsletter(token, id);
            await loadData();
            if (editingNewsletterId === id)
                resetNewsletterForm();
        }
        catch (caughtError) {
            const message = caughtError instanceof InfoCulturaApiError
                ? caughtError.message
                : caughtError instanceof Error
                    ? caughtError.message
                    : 'Nao foi possivel apagar a newsletter.';
            setError(message);
        }
        finally {
            setDeletingNewsletterId(null);
        }
    };
    const handleDeleteSubscriber = async (id) => {
        if (!token || !window.confirm('Apagar este subscritor?'))
            return;
        setDeletingSubscriberId(id);
        setError('');
        try {
            await deleteAdminNewsletterSubscriber(token, id);
            await loadData();
            if (editingSubscriberId === id)
                resetSubscriberForm();
        }
        catch (caughtError) {
            const message = caughtError instanceof InfoCulturaApiError
                ? caughtError.message
                : caughtError instanceof Error
                    ? caughtError.message
                    : 'Nao foi possivel apagar o subscritor.';
            setError(message);
        }
        finally {
            setDeletingSubscriberId(null);
        }
    };
    const handleSendNewsletter = async (id) => {
        if (!token)
            return;
        setSendingNewsletterId(id);
        setError('');
        try {
            await sendAdminNewsletter(token, id);
            await loadData();
        }
        catch (caughtError) {
            const message = caughtError instanceof InfoCulturaApiError
                ? caughtError.message
                : caughtError instanceof Error
                    ? caughtError.message
                    : 'Nao foi possivel enviar a newsletter.';
            setError(message);
        }
        finally {
            setSendingNewsletterId(null);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(AdminPageHero, { icon: Mail, title: "Newsletters", description: "Criacao, gestao e envio de campanhas por email para os subscritores ativos.", tone: "blue", stats: [
                    { label: 'Newsletters', value: newsletters.length },
                    { label: 'Subscritores ativos', value: activeSubscribers },
                    {
                        label: 'Enviadas',
                        value: newsletters.filter((newsletter) => newsletter.status === 'sent').length,
                    },
                ] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx("button", { type: "button", className: activeTab === 'newsletters' ? adminBtnPrimary : adminBtnSecondary, onClick: () => setActiveTab('newsletters'), children: "Newsletters" }), _jsx("button", { type: "button", className: activeTab === 'subscribers' ? adminBtnPrimary : adminBtnSecondary, onClick: () => setActiveTab('subscribers'), children: "Subscritores" })] }), error ? _jsx("p", { className: adminError, children: error }) : null, activeTab === 'newsletters' ? (_jsxs("div", { className: "grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]", children: [_jsxs("form", { onSubmit: handleNewsletterSubmit, className: adminPanelForm, children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: blockTitle, children: editingNewsletterId ? 'Editar newsletter' : 'Nova newsletter' }), _jsx("p", { className: blockText, children: "Define o titulo interno, assunto e conteudo da campanha." })] }), _jsx("button", { type: "button", className: adminBtnSecondary, onClick: resetNewsletterForm, children: _jsx(RotateCcw, { size: 16 }) })] }), _jsxs("div", { className: adminFormGridSpaced, children: [_jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "newsletter-title", children: "Titulo" }), _jsx("input", { id: "newsletter-title", className: adminInput, value: newsletterForm.title, onChange: (event) => setNewsletterForm((prev) => ({ ...prev, title: event.target.value })) })] }), _jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "newsletter-subject", children: "Assunto" }), _jsx("input", { id: "newsletter-subject", className: adminInput, value: newsletterForm.subject, onChange: (event) => setNewsletterForm((prev) => ({ ...prev, subject: event.target.value })) })] }), _jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "newsletter-status", children: "Estado" }), _jsxs("select", { id: "newsletter-status", className: adminInput, value: newsletterForm.status, onChange: (event) => setNewsletterForm((prev) => ({ ...prev, status: event.target.value })), children: [_jsx("option", { value: "draft", children: "Rascunho" }), _jsx("option", { value: "scheduled", children: "Agendada" }), _jsx("option", { value: "sent", children: "Enviada" }), _jsx("option", { value: "cancelled", children: "Cancelada" })] })] })] }), _jsxs("div", { className: adminFieldSpaced, children: [_jsx("label", { className: adminLabel, htmlFor: "newsletter-content", children: "Conteudo" }), _jsx("textarea", { id: "newsletter-content", rows: 12, className: adminTextarea, value: newsletterForm.content, onChange: (event) => setNewsletterForm((prev) => ({ ...prev, content: event.target.value })) })] }), _jsx("div", { className: adminActions, children: _jsxs("button", { type: "submit", className: adminBtnPrimary, disabled: savingNewsletter, children: [_jsx(Plus, { size: 16 }), savingNewsletter ? 'A guardar...' : editingNewsletterId ? 'Atualizar' : 'Criar'] }) })] }), _jsxs("div", { className: adminList, children: [_jsxs("div", { className: adminListTop, children: [_jsxs("div", { children: [_jsx("h3", { className: adminListTitle, children: "Campanhas registadas" }), _jsx("p", { className: adminListMeta, children: "Lista das newsletters preparadas para envio." })] }), loading ? _jsx("p", { className: adminInfo, children: "A carregar..." }) : null] }), newsletters.map((newsletter) => (_jsxs("article", { className: adminListItem, children: [_jsxs("div", { className: adminListTop, children: [_jsxs("div", { children: [_jsx("h4", { className: adminListTitle, children: newsletter.title }), _jsxs("p", { className: adminListMeta, children: [newsletter.subject, " \u00B7 ", newsletter.status, " \u00B7 ", newsletter.user_name || 'Sistema'] })] }), _jsx("span", { className: adminListMeta, children: newsletter.sent_at
                                                    ? `Enviada ${formatAdminDateTime(newsletter.sent_at)}`
                                                    : formatAdminDateTime(newsletter.created_at) })] }), _jsx("p", { className: adminListDesc, children: newsletter.content }), _jsxs("div", { className: adminListTools, children: [_jsxs("button", { type: "button", className: adminBtnEdit, onClick: () => handleEditNewsletter(newsletter), children: [_jsx(Pencil, { size: 16 }), "Editar"] }), _jsxs("button", { type: "button", className: adminBtnPrimary, onClick: () => handleSendNewsletter(newsletter.id), disabled: sendingNewsletterId === newsletter.id, children: [_jsx(SendHorizonal, { size: 16 }), sendingNewsletterId === newsletter.id ? 'A enviar...' : 'Enviar'] }), _jsxs("button", { type: "button", className: adminBtnDanger, onClick: () => handleDeleteNewsletter(newsletter.id), disabled: deletingNewsletterId === newsletter.id, children: [_jsx(Trash2, { size: 16 }), deletingNewsletterId === newsletter.id ? 'A apagar...' : 'Apagar'] })] })] }, newsletter.id))), !loading && newsletters.length === 0 ? (_jsx("p", { className: adminInfo, children: "Nao existem newsletters registadas." })) : null] })] })) : (_jsxs("div", { className: "grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]", children: [_jsxs("form", { onSubmit: handleSubscriberSubmit, className: adminPanelForm, children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: blockTitle, children: editingSubscriberId ? 'Editar subscritor' : 'Novo subscritor' }), _jsx("p", { className: blockText, children: "Adiciona ou ativa emails para receberem as campanhas." })] }), _jsx("button", { type: "button", className: adminBtnSecondary, onClick: resetSubscriberForm, children: _jsx(RotateCcw, { size: 16 }) })] }), _jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "subscriber-email", children: "Email" }), _jsx("input", { id: "subscriber-email", type: "email", className: adminInput, value: subscriberForm.email, onChange: (event) => setSubscriberForm((prev) => ({ ...prev, email: event.target.value })) })] }), _jsxs("div", { className: adminField, children: [_jsx("label", { className: adminLabel, htmlFor: "subscriber-active", children: "Ativo" }), _jsxs("select", { id: "subscriber-active", className: adminInput, value: subscriberForm.is_active ? '1' : '0', onChange: (event) => setSubscriberForm((prev) => ({
                                            ...prev,
                                            is_active: event.target.value === '1',
                                        })), children: [_jsx("option", { value: "1", children: "Sim" }), _jsx("option", { value: "0", children: "Nao" })] })] }), _jsx("div", { className: adminActions, children: _jsxs("button", { type: "submit", className: adminBtnPrimary, disabled: savingSubscriber, children: [_jsx(Plus, { size: 16 }), savingSubscriber ? 'A guardar...' : editingSubscriberId ? 'Atualizar' : 'Criar'] }) })] }), _jsxs("div", { className: adminList, children: [_jsxs("div", { className: adminListTop, children: [_jsxs("div", { children: [_jsx("h3", { className: adminListTitle, children: "Subscritores" }), _jsx("p", { className: adminListMeta, children: "Emails que recebem newsletters ativas." })] }), loading ? _jsx("p", { className: adminInfo, children: "A carregar..." }) : null] }), subscribers.map((subscriber) => (_jsxs("article", { className: adminListItem, children: [_jsxs("div", { className: adminListTop, children: [_jsxs("div", { children: [_jsx("h4", { className: adminListTitle, children: subscriber.email }), _jsxs("p", { className: adminListMeta, children: [subscriber.is_active ? 'Ativo' : 'Inativo', " \u00B7", ' ', formatAdminDateTime(subscriber.subscribed_at)] })] }), _jsx(Users, { size: 18 })] }), _jsxs("div", { className: adminListTools, children: [_jsxs("button", { type: "button", className: adminBtnEdit, onClick: () => handleEditSubscriber(subscriber), children: [_jsx(Pencil, { size: 16 }), "Editar"] }), _jsxs("button", { type: "button", className: adminBtnDanger, onClick: () => handleDeleteSubscriber(subscriber.id), disabled: deletingSubscriberId === subscriber.id, children: [_jsx(Trash2, { size: 16 }), deletingSubscriberId === subscriber.id ? 'A apagar...' : 'Apagar'] })] })] }, subscriber.id))), !loading && subscribers.length === 0 ? (_jsx("p", { className: adminInfo, children: "Nao existem subscritores registados." })) : null] })] }))] }));
}
export default NewslettersPage;
