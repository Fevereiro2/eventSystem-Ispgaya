import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Mail, SendHorizonal, Users, Pencil, Trash2, Plus, RotateCcw } from 'lucide-react';

import AdminPageHero from '../components/AdminPageHero.js';
import {
  adminActions,
  adminBtnDanger,
  adminBtnEdit,
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminField,
  adminFieldSpaced,
  adminFormGridSpaced,
  adminInfo,
  adminInput,
  adminLabel,
  adminList,
  adminListDesc,
  adminListItem,
  adminListMeta,
  adminListTitle,
  adminListTools,
  adminListTop,
  adminPanelForm,
  adminTextarea,
  blockText,
  blockTitle,
} from '../../../styles/ui.js';
import {
  InfoCulturaApiError,
  InfoCulturaNewsletter,
  InfoCulturaNewsletterSubscriber,
  NewsletterPayload,
  NewsletterSubscriberPayload,
  createAdminNewsletter,
  createAdminNewsletterSubscriber,
  deleteAdminNewsletter,
  deleteAdminNewsletterSubscriber,
  fetchAdminNewsletterSubscribers,
  fetchAdminNewsletters,
  getStoredAccessToken,
  sendAdminNewsletter,
  updateAdminNewsletter,
  updateAdminNewsletterSubscriber,
} from '../../../api/infoculturaApi.js';
import { formatAdminDateTime } from '../utils.js';
import { getLocaleText, useLocale } from '../../../i18n/locale.js';

type NewsletterFormState = NewsletterPayload;
type SubscriberFormState = NewsletterSubscriberPayload;

const initialNewsletterForm: NewsletterFormState = {
  title: '',
  subject: '',
  content: '',
  status: 'draft',
};

const initialSubscriberForm: SubscriberFormState = {
  email: '',
  is_active: true,
};

function NewslettersPage() {
  const localeContext = useLocale();
  const locale = localeContext.locale || 'pt';
  const token = getStoredAccessToken();
  const [newsletters, setNewsletters] = useState<InfoCulturaNewsletter[]>([]);
  const [subscribers, setSubscribers] = useState<InfoCulturaNewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'newsletters' | 'subscribers'>('newsletters');
  const [newsletterForm, setNewsletterForm] = useState<NewsletterFormState>(initialNewsletterForm);
  const [subscriberForm, setSubscriberForm] =
    useState<SubscriberFormState>(initialSubscriberForm);
  const [editingNewsletterId, setEditingNewsletterId] = useState<number | null>(null);
  const [editingSubscriberId, setEditingSubscriberId] = useState<number | null>(null);
  const [savingNewsletter, setSavingNewsletter] = useState(false);
  const [savingSubscriber, setSavingSubscriber] = useState(false);
  const [sendingNewsletterId, setSendingNewsletterId] = useState<number | null>(null);
  const [deletingNewsletterId, setDeletingNewsletterId] = useState<number | null>(null);
  const [deletingSubscriberId, setDeletingSubscriberId] = useState<number | null>(null);

  const activeSubscribers = useMemo(
    () => subscribers.filter((subscriber) => subscriber.is_active).length,
    [subscribers]
  );

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const [nextNewsletters, nextSubscribers] = await Promise.all([
        fetchAdminNewsletters(token, { page: 1, pageSize: 50 }),
        fetchAdminNewsletterSubscribers(token, { page: 1, pageSize: 100 }),
      ]);
      setNewsletters(nextNewsletters.items);
      setSubscribers(nextSubscribers.items);
    } catch (caughtError) {
      const message =
        caughtError instanceof InfoCulturaApiError
          ? caughtError.message
          : caughtError instanceof Error
            ? caughtError.message
            : getLocaleText(locale, 'Nao foi possivel carregar as newsletters.', 'Could not load newsletters.');
      setError(message);
    } finally {
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

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setSavingNewsletter(true);
    setError('');

    try {
      if (editingNewsletterId) {
        await updateAdminNewsletter(token, editingNewsletterId, newsletterForm);
      } else {
        await createAdminNewsletter(token, newsletterForm);
      }
      await loadData();
      resetNewsletterForm();
    } catch (caughtError) {
      const message =
        caughtError instanceof InfoCulturaApiError
          ? caughtError.message
          : caughtError instanceof Error
            ? caughtError.message
            : getLocaleText(locale, 'Nao foi possivel guardar a newsletter.', 'Could not save the newsletter.');
      setError(message);
    } finally {
      setSavingNewsletter(false);
    }
  };

  const handleSubscriberSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setSavingSubscriber(true);
    setError('');

    try {
      if (editingSubscriberId) {
        await updateAdminNewsletterSubscriber(token, editingSubscriberId, subscriberForm);
      } else {
        await createAdminNewsletterSubscriber(token, subscriberForm);
      }
      await loadData();
      resetSubscriberForm();
    } catch (caughtError) {
      const message =
        caughtError instanceof InfoCulturaApiError
          ? caughtError.message
          : caughtError instanceof Error
            ? caughtError.message
            : getLocaleText(locale, 'Nao foi possivel guardar o subscritor.', 'Could not save the subscriber.');
      setError(message);
    } finally {
      setSavingSubscriber(false);
    }
  };

  const handleEditNewsletter = (newsletter: InfoCulturaNewsletter) => {
    setEditingNewsletterId(newsletter.id);
    setNewsletterForm({
      title: newsletter.title,
      subject: newsletter.subject,
      content: newsletter.content,
      status: newsletter.status,
    });
    setActiveTab('newsletters');
  };

  const handleEditSubscriber = (subscriber: InfoCulturaNewsletterSubscriber) => {
    setEditingSubscriberId(subscriber.id);
    setSubscriberForm({
      email: subscriber.email,
      is_active: subscriber.is_active,
    });
    setActiveTab('subscribers');
  };

  const handleDeleteNewsletter = async (id: number) => {
    if (!token || !window.confirm('Apagar esta newsletter?')) return;
    setDeletingNewsletterId(id);
    setError('');

    try {
      await deleteAdminNewsletter(token, id);
      await loadData();
      if (editingNewsletterId === id) resetNewsletterForm();
    } catch (caughtError) {
      const message =
        caughtError instanceof InfoCulturaApiError
          ? caughtError.message
          : caughtError instanceof Error
            ? caughtError.message
            : getLocaleText(locale, 'Nao foi possivel apagar a newsletter.', 'Could not delete the newsletter.');
      setError(message);
    } finally {
      setDeletingNewsletterId(null);
    }
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!token || !window.confirm(getLocaleText(locale, 'Apagar este subscritor?', 'Delete this subscriber?'))) return;
    setDeletingSubscriberId(id);
    setError('');

    try {
      await deleteAdminNewsletterSubscriber(token, id);
      await loadData();
      if (editingSubscriberId === id) resetSubscriberForm();
    } catch (caughtError) {
      const message =
        caughtError instanceof InfoCulturaApiError
          ? caughtError.message
          : caughtError instanceof Error
            ? caughtError.message
            : getLocaleText(locale, 'Nao foi possivel apagar o subscritor.', 'Could not delete the subscriber.');
      setError(message);
    } finally {
      setDeletingSubscriberId(null);
    }
  };

  const handleSendNewsletter = async (id: number) => {
    if (!token) return;
    setSendingNewsletterId(id);
    setError('');

    try {
      await sendAdminNewsletter(token, id);
      await loadData();
    } catch (caughtError) {
      const message =
        caughtError instanceof InfoCulturaApiError
          ? caughtError.message
          : caughtError instanceof Error
            ? caughtError.message
            : getLocaleText(locale, 'Nao foi possivel enviar a newsletter.', 'Could not send the newsletter.');
      setError(message);
    } finally {
      setSendingNewsletterId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHero
        icon={Mail}
        title={getLocaleText(locale, 'Newsletters', 'Newsletters')}
        description={getLocaleText(locale, 'Criacao, gestao e envio de campanhas por email para os subscritores ativos.', 'Creation, management and sending of email campaigns to active subscribers.')}
        tone="blue"
        stats={[
          { label: getLocaleText(locale, 'Newsletters', 'Newsletters'), value: newsletters.length },
          { label: getLocaleText(locale, 'Subscritores ativos', 'Active Subscribers'), value: activeSubscribers },
          {
            label: getLocaleText(locale, 'Enviadas', 'Sent'),
            value: newsletters.filter((newsletter) => newsletter.status === 'sent').length,
          },
        ]}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={activeTab === 'newsletters' ? adminBtnPrimary : adminBtnSecondary}
          onClick={() => setActiveTab('newsletters')}
        >
          Newsletters
        </button>
        <button
          type="button"
          className={activeTab === 'subscribers' ? adminBtnPrimary : adminBtnSecondary}
          onClick={() => setActiveTab('subscribers')}
        >
          Subscritores
        </button>
      </div>

      {error ? <p className={adminError}>{error}</p> : null}

      {activeTab === 'newsletters' ? (
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={handleNewsletterSubmit} className={adminPanelForm}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className={blockTitle}>{editingNewsletterId ? getLocaleText(locale, 'Editar newsletter', 'Edit Newsletter') : getLocaleText(locale, 'Nova newsletter', 'New Newsletter')}</h2>
                <p className={blockText}> {getLocaleText(locale, 'Define o titulo interno, assunto e conteudo da campanha.', 'Define the internal title, subject and content of the campaign.')}</p>
              </div>
              <button type="button" className={adminBtnSecondary} onClick={resetNewsletterForm}>
                <RotateCcw size={16} />
              </button>
            </div>

            <div className={adminFormGridSpaced}>
              <div className={adminField}>
                <label className={adminLabel} htmlFor="newsletter-title">
                  Titulo 
                </label>
                <input
                  id="newsletter-title"
                  className={adminInput}
                  value={newsletterForm.title}
                  onChange={(event) =>
                    setNewsletterForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>

              <div className={adminField}>
                <label className={adminLabel} htmlFor="newsletter-subject">
                  Assunto
                </label>
                <input
                  id="newsletter-subject"
                  className={adminInput}
                  value={newsletterForm.subject}
                  onChange={(event) =>
                    setNewsletterForm((prev) => ({ ...prev, subject: event.target.value }))
                  }
                />
              </div>

              <div className={adminField}>
                <label className={adminLabel} htmlFor="newsletter-status">
                  Estado
                </label>
                <select
                  id="newsletter-status"
                  className={adminInput}
                  value={newsletterForm.status}
                  onChange={(event) =>
                    setNewsletterForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  <option value="draft">Rascunho</option>
                  <option value="scheduled">Agendada</option>
                  <option value="sent">Enviada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>

            <div className={adminFieldSpaced}>
              <label className={adminLabel} htmlFor="newsletter-content">
                Conteudo
              </label>
              <textarea
                id="newsletter-content"
                rows={12}
                className={adminTextarea}
                value={newsletterForm.content}
                onChange={(event) =>
                  setNewsletterForm((prev) => ({ ...prev, content: event.target.value }))
                }
              />
            </div>

            <div className={adminActions}>
              <button type="submit" className={adminBtnPrimary} disabled={savingNewsletter}>
                <Plus size={16} />
                {savingNewsletter ? 'A guardar...' : editingNewsletterId ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>

          <div className={adminList}>
            <div className={adminListTop}>
              <div>
                <h3 className={adminListTitle}>Campanhas registadas</h3>
                <p className={adminListMeta}>Lista das newsletters preparadas para envio.</p>
              </div>
              {loading ? <p className={adminInfo}>A carregar...</p> : null}
            </div>

            {newsletters.map((newsletter) => (
              <article key={newsletter.id} className={adminListItem}>
                <div className={adminListTop}>
                  <div>
                    <h4 className={adminListTitle}>{newsletter.title}</h4>
                    <p className={adminListMeta}>
                      {newsletter.subject} · {newsletter.status} · {newsletter.user_name || 'Sistema'}
                    </p>
                  </div>
                  <span className={adminListMeta}>
                    {newsletter.sent_at
                      ? `Enviada ${formatAdminDateTime(newsletter.sent_at)}`
                      : formatAdminDateTime(newsletter.created_at)}
                  </span>
                </div>

                <p className={adminListDesc}>{newsletter.content}</p>

                <div className={adminListTools}>
                  <button
                    type="button"
                    className={adminBtnEdit}
                    onClick={() => handleEditNewsletter(newsletter)}
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className={adminBtnPrimary}
                    onClick={() => handleSendNewsletter(newsletter.id)}
                    disabled={sendingNewsletterId === newsletter.id}
                  >
                    <SendHorizonal size={16} />
                    {sendingNewsletterId === newsletter.id ? 'A enviar...' : 'Enviar'}
                  </button>
                  <button
                    type="button"
                    className={adminBtnDanger}
                    onClick={() => handleDeleteNewsletter(newsletter.id)}
                    disabled={deletingNewsletterId === newsletter.id}
                  >
                    <Trash2 size={16} />
                    {deletingNewsletterId === newsletter.id ? 'A apagar...' : 'Apagar'}
                  </button>
                </div>
              </article>
            ))}

            {!loading && newsletters.length === 0 ? (
              <p className={adminInfo}>Nao existem newsletters registadas.</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <form onSubmit={handleSubscriberSubmit} className={adminPanelForm}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className={blockTitle}>
                  {editingSubscriberId ? 'Editar subscritor' : 'Novo subscritor'}
                </h2>
                <p className={blockText}>
                  Adiciona ou ativa emails para receberem as campanhas.
                </p>
              </div>
              <button type="button" className={adminBtnSecondary} onClick={resetSubscriberForm}>
                <RotateCcw size={16} />
              </button>
            </div>

            <div className={adminField}>
              <label className={adminLabel} htmlFor="subscriber-email">
                Email
              </label>
              <input
                id="subscriber-email"
                type="email"
                className={adminInput}
                value={subscriberForm.email}
                onChange={(event) =>
                  setSubscriberForm((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>

            <div className={adminField}>
              <label className={adminLabel} htmlFor="subscriber-active">
                Ativo
              </label>
              <select
                id="subscriber-active"
                className={adminInput}
                value={subscriberForm.is_active ? '1' : '0'}
                onChange={(event) =>
                  setSubscriberForm((prev) => ({
                    ...prev,
                    is_active: event.target.value === '1',
                  }))
                }
              >
                <option value="1">Sim</option>
                <option value="0">Nao</option>
              </select>
            </div>

            <div className={adminActions}>
              <button type="submit" className={adminBtnPrimary} disabled={savingSubscriber}>
                <Plus size={16} />
                {savingSubscriber ? 'A guardar...' : editingSubscriberId ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>

          <div className={adminList}>
            <div className={adminListTop}>
              <div>
                <h3 className={adminListTitle}>Subscritores</h3>
                <p className={adminListMeta}>Emails que recebem newsletters ativas.</p>
              </div>
              {loading ? <p className={adminInfo}>A carregar...</p> : null}
            </div>

            {subscribers.map((subscriber) => (
              <article key={subscriber.id} className={adminListItem}>
                <div className={adminListTop}>
                  <div>
                    <h4 className={adminListTitle}>{subscriber.email}</h4>
                    <p className={adminListMeta}>
                      {subscriber.is_active ? 'Ativo' : 'Inativo'} ·{' '}
                      {formatAdminDateTime(subscriber.subscribed_at)}
                    </p>
                  </div>
                  <Users size={18} />
                </div>

                <div className={adminListTools}>
                  <button
                    type="button"
                    className={adminBtnEdit}
                    onClick={() => handleEditSubscriber(subscriber)}
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className={adminBtnDanger}
                    onClick={() => handleDeleteSubscriber(subscriber.id)}
                    disabled={deletingSubscriberId === subscriber.id}
                  >
                    <Trash2 size={16} />
                    {deletingSubscriberId === subscriber.id ? 'A apagar...' : 'Apagar'}
                  </button>
                </div>
              </article>
            ))}

            {!loading && subscribers.length === 0 ? (
              <p className={adminInfo}>Nao existem subscritores registados.</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default NewslettersPage;
