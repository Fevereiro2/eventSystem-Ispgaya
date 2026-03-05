import { FormEvent, useMemo, useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import TopBar from '../components/TopBar';
import {
  adminActions,
  adminBadge,
  adminBtnDanger,
  adminBtnEdit,
  adminBtnPrimary,
  adminBtnSecondary,
  adminField,
  adminFormGrid,
  adminHeaderRow,
  adminInfo,
  adminInput,
  adminLabel,
  adminLink,
  adminList,
  adminListDesc,
  adminListItem,
  adminListMeta,
  adminListTitle,
  adminListTools,
  adminListTop,
  adminLoginWrap,
  adminTextarea,
  blockText,
  blockTitle,
  container,
  contentSection,
  mainContent
} from '../styles/ui';
import {
  createId,
  CulturalArea,
  CulturalItem,
  getAreaLabel,
  getCulturalItems,
  saveCulturalItems
} from '../data/culturalContent';

const AUTH_KEY = 'ispgaya_cultura_admin_auth';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'cultura2026';

type FormState = {
  area: CulturalArea;
  title: string;
  description: string;
  date: string;
  status: 'rascunho' | 'publicado';
};

const initialForm: FormState = {
  area: 'tuna',
  title: '',
  description: '',
  date: '',
  status: 'rascunho'
};

function AdminCultura() {
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuth, setIsAuth] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(AUTH_KEY) === '1';
  });

  const [items, setItems] = useState<CulturalItem[]>(() => getCulturalItems());
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [items]
  );

  function persist(nextItems: CulturalItem[]) {
    setItems(nextItems);
    saveCulturalItems(nextItems);
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authUser === ADMIN_USER && authPass === ADMIN_PASS) {
      setAuthError('');
      setIsAuth(true);
      sessionStorage.setItem(AUTH_KEY, '1');
      return;
    }

    setAuthError('Credenciais invalidas.');
  }

  function handleLogout() {
    setIsAuth(false);
    sessionStorage.removeItem(AUTH_KEY);
    setAuthUser('');
    setAuthPass('');
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      area: form.area,
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      status: form.status
    };

    if (!payload.title || !payload.description || !payload.date) {
      return;
    }

    if (editingId) {
      const nextItems = items.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...payload,
              updatedAt: new Date().toISOString()
            }
          : item
      );

      persist(nextItems);
      resetForm();
      return;
    }

    const nextItems = [
      ...items,
      {
        id: createId(),
        ...payload,
        updatedAt: new Date().toISOString()
      }
    ];

    persist(nextItems);
    resetForm();
  }

  function handleEdit(item: CulturalItem) {
    setEditingId(item.id);
    setForm({
      area: item.area,
      title: item.title,
      description: item.description,
      date: item.date,
      status: item.status
    });
  }

  function handleDelete(id: string) {
    const nextItems = items.filter((item) => item.id !== id);
    persist(nextItems);

    if (editingId === id) {
      resetForm();
    }
  }

  return (
    <>
      <TopBar />
      <HeaderNav />
      <Breadcrumbs
        title="Admin Cultura"
        description="Area de administracao para gerir conteudos do Laboratorio Cultural."
        parentLabel="Laboratorio Cultural"
        parentHref="/laboratorio-cultural"
        currentLabel="Admin Cultura"
        currentHref="/laboratorio-cultural/admin"
      />

      <main className={mainContent}>
        <section className={contentSection}>
          <div className={container}>
            {!isAuth ? (
              <div className={adminLoginWrap}>
                <h2 className={blockTitle}>Acesso Admin</h2>
                <p className={blockText}>
                  Entra com credenciais de administracao para gerir os conteudos.
                </p>
                <form className="mt-5 space-y-3" onSubmit={handleLogin}>
                  <div className={adminField}>
                    <label htmlFor="admin-user" className={adminLabel}>
                      Utilizador
                    </label>
                    <input
                      id="admin-user"
                      className={adminInput}
                      value={authUser}
                      onChange={(event) => setAuthUser(event.target.value)}
                    />
                  </div>
                  <div className={adminField}>
                    <label htmlFor="admin-pass" className={adminLabel}>
                      Password
                    </label>
                    <input
                      id="admin-pass"
                      type="password"
                      className={adminInput}
                      value={authPass}
                      onChange={(event) => setAuthPass(event.target.value)}
                    />
                  </div>
                  {authError ? <p className="text-sm text-red-600">{authError}</p> : null}
                  <div className={adminActions}>
                    <button type="submit" className={adminBtnPrimary}>
                      Entrar
                    </button>
                    <a
                      href="https://inforestudante.ispgaya.pt/nonio/security/login.do"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={adminLink}
                    >
                      Login Inforestudante
                    </a>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className={adminHeaderRow}>
                  <span className={adminBadge}>Admin Cultura</span>
                  <p className={adminInfo}>Gestao de Tuna, Clube de Leitura e Teatro.</p>
                  <button type="button" onClick={handleLogout} className={adminBtnSecondary}>
                    Terminar sessao
                  </button>
                </div>

                <form onSubmit={handleSave} className="max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className={blockTitle}>
                    {editingId ? 'Editar Conteudo' : 'Novo Conteudo'}
                  </h2>
                  <p className={blockText}>
                    Cria ou atualiza conteudo para as paginas do Laboratorio Cultural.
                  </p>

                  <div className={`${adminFormGrid} mt-5`}>
                    <div className={adminField}>
                      <label className={adminLabel} htmlFor="area">
                        Area
                      </label>
                      <select
                        id="area"
                        className={adminInput}
                        value={form.area}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            area: event.target.value as CulturalArea
                          }))
                        }
                      >
                        <option value="tuna">Tuna Academica</option>
                        <option value="clube-leitura">Clube de Leitura</option>
                        <option value="teatro">Teatro</option>
                      </select>
                    </div>

                    <div className={adminField}>
                      <label className={adminLabel} htmlFor="date">
                        Data
                      </label>
                      <input
                        id="date"
                        type="date"
                        className={adminInput}
                        value={form.date}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, date: event.target.value }))
                        }
                      />
                    </div>

                    <div className={adminField}>
                      <label className={adminLabel} htmlFor="title">
                        Titulo
                      </label>
                      <input
                        id="title"
                        className={adminInput}
                        value={form.title}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                      />
                    </div>

                    <div className={adminField}>
                      <label className={adminLabel} htmlFor="status">
                        Estado
                      </label>
                      <select
                        id="status"
                        className={adminInput}
                        value={form.status}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            status: event.target.value as 'rascunho' | 'publicado'
                          }))
                        }
                      >
                        <option value="rascunho">Rascunho</option>
                        <option value="publicado">Publicado</option>
                      </select>
                    </div>
                  </div>

                  <div className={`${adminField} mt-4`}>
                    <label className={adminLabel} htmlFor="description">
                      Descricao
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      className={adminTextarea}
                      value={form.description}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                    />
                  </div>

                  <div className={adminActions}>
                    <button type="submit" className={adminBtnPrimary}>
                      {editingId ? 'Atualizar' : 'Criar'}
                    </button>
                    <button type="button" onClick={resetForm} className={adminBtnSecondary}>
                      Limpar
                    </button>
                  </div>
                </form>

                <div className={adminList}>
                  {sortedItems.map((item) => (
                    <article key={item.id} className={adminListItem}>
                      <div className={adminListTop}>
                        <div>
                          <h3 className={adminListTitle}>{item.title}</h3>
                          <p className={adminListMeta}>
                            {getAreaLabel(item.area)} · {item.date} · {item.status}
                          </p>
                        </div>
                      </div>

                      <p className={adminListDesc}>{item.description}</p>

                      <div className={adminListTools}>
                        <button
                          type="button"
                          className={adminBtnEdit}
                          onClick={() => handleEdit(item)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={adminBtnDanger}
                          onClick={() => handleDelete(item.id)}
                        >
                          Apagar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default AdminCultura;
