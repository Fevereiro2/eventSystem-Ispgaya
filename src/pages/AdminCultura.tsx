import { FormEvent, useEffect, useMemo, useState } from 'react';
import infoCulturaBg from '../assets/19825874_uqliU.jpeg';
import ispgayaLogo from '../assets/ispgaya-logo.svg';
import {
  adminActions,
  adminBadge,
  adminBtnDanger,
  adminBtnEdit,
  adminBtnPrimary,
  adminBtnSecondary,
  adminError,
  adminField,
  adminFieldSpaced,
  adminFormGridSpaced,
  adminHeaderRow,
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
  container,
  infoLegacyBackdropImage,
  infoLegacyBackdropOverlay,
  infoLegacyBrandLogo,
  infoLegacyBrandSub,
  infoLegacyBrandText,
  infoLegacyBrandWrap,
  infoLegacyCenter,
  infoLegacyChrome,
  infoLegacyGrid,
  infoLegacyFooter,
  infoLegacyFooterInner,
  infoLegacyHeader,
  infoLegacyHeaderInner,
  infoLegacyLeft,
  infoLegacyBlock,
  infoLegacyBlockTitle,
  infoLegacyBlockText,
  infoLegacyBlockList,
  infoLegacyInput,
  infoLegacyLang,
  infoLegacyLoginForm,
  infoLegacyLoginHint,
  infoLegacyPanel,
  infoLegacyRight,
  infoLegacyLoginStage,
  infoLegacyLoginTitle,
  infoLegacyMain,
  infoLegacyMeta,
  infoLegacyPage,
  infoLegacyPrimaryButton,
} from '../styles/ui';
import {
  CulturalArea,
  CulturalItem,
  getAreaLabel,
} from '../data/culturalContent';
import {
  createAdminContent,
  deleteAdminContent,
  fetchAdminContent,
  loginInfoCultura,
  updateAdminContent
} from '../data/infoculturaApi';

const TOKEN_KEY = 'ispgaya_cultura_token';

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
  const [token, setToken] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(TOKEN_KEY) || '';
  });
  const isAuth = token.length > 0;
  const [items, setItems] = useState<CulturalItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [panelError, setPanelError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [items]
  );

  function clearAuth() {
    setToken('');
    setItems([]);
    setPanelError('');
    sessionStorage.removeItem(TOKEN_KEY);
  }

  async function loadAdminItems(authToken: string) {
    setIsLoadingItems(true);
    setPanelError('');

    try {
      const nextItems = await fetchAdminContent(authToken);
      setItems(nextItems);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel carregar os conteudos.';
      setPanelError(message);

      if (message.toLowerCase().includes('token')) {
        clearAuth();
      }
    } finally {
      setIsLoadingItems(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    void loadAdminItems(token);
  }, [token]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError('');

    try {
      const nextToken = await loginInfoCultura(authUser, authPass);
      setToken(nextToken);
      sessionStorage.setItem(TOKEN_KEY, nextToken);
      setAuthPass('');
      setAuthUser('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Credenciais invalidas.';
      setAuthError(message);
    }
  }

  function handleLogout() {
    clearAuth();
    setAuthUser('');
    setAuthPass('');
    resetForm();
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const payload = {
      area: form.area,
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      status: form.status
    };

    if (!payload.title || !payload.description || !payload.date) {
      setPanelError('Preenche todos os campos obrigatorios.');
      return;
    }

    setIsSaving(true);
    setPanelError('');

    try {
      if (editingId) {
        const updated = await updateAdminContent(token, editingId, payload);
        setItems((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        resetForm();
        return;
      }

      const created = await createAdminContent(token, payload);
      setItems((prev) => [created, ...prev]);
      resetForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel guardar o conteudo.';
      setPanelError(message);
    } finally {
      setIsSaving(false);
    }
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

  async function handleDelete(id: string) {
    if (!token) return;

    setDeletingId(id);
    setPanelError('');

    try {
      await deleteAdminContent(token, id);
      setItems((prev) => prev.filter((item) => item.id !== id));

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel apagar o conteudo.';
      setPanelError(message);
    } finally {
      setDeletingId(null);
    }
  }

  if (!isAuth) {
    return (
      <div className={infoLegacyLoginStage}>
        <img src={infoCulturaBg} alt="" className={infoLegacyBackdropImage} />
        <div className={infoLegacyBackdropOverlay} />
        <div className={infoLegacyChrome}>
          <header className={infoLegacyHeader}>
            <div className={infoLegacyHeaderInner}>
              <div className={infoLegacyBrandWrap}>
                <img src={ispgayaLogo} alt="ISPGAYA" className={infoLegacyBrandLogo} />
                <div>
                  <p className={infoLegacyBrandText}>InfoCultura</p>
                  <p className={infoLegacyBrandSub}>Gestao cultural interna</p>
                </div>
              </div>
              <p className={infoLegacyLang}>PT | EN</p>
            </div>
          </header>

          <main className={infoLegacyCenter}>
            <div className={infoLegacyPanel}>
              <div className={infoLegacyGrid}>
                <div className={infoLegacyLeft}>
                  <div className={infoLegacyBlock}>
                    <h3 className={infoLegacyBlockTitle}>Laboratorio Cultural</h3>
                    <p className={infoLegacyBlockText}>
                      A nossa abordagem cultural e interdisciplinar, promovendo criacao
                      artistica, participacao academica e ligacao com a comunidade.
                    </p>
                    <ul className={infoLegacyBlockList}>
                      <li>Organizar programacao cultural</li>
                      <li>Atualizar noticias por area</li>
                      <li>Gerir conteudo em rascunho e publicado</li>
                    </ul>
                  </div>

                  <div className={infoLegacyBlock}>
                    <h3 className={infoLegacyBlockTitle}>Primeiro acesso</h3>
                    <p className={infoLegacyBlockText}>
                      Se e a primeira vez a usar o portal, contacte a equipa tecnica para
                      atribuicao de credenciais de administrador.
                    </p>
                  </div>
                </div>

                <div className={infoLegacyRight}>


                  <h2 className={infoLegacyLoginTitle}>Entrar</h2>
                  <p className={infoLegacyLoginHint}>
                    Acesso reservado aos administradores do InfoCultura.
                  </p>

                  <form className={infoLegacyLoginForm} onSubmit={handleLogin}>
                    <div className={adminField}>
                      <label htmlFor="admin-user" className={adminLabel}>
                        Utilizador
                      </label>
                      <input
                        id="admin-user"
                        className={infoLegacyInput}
                        placeholder="Utilizador"
                        value={authUser}
                        onChange={(event) => setAuthUser(event.target.value)}
                      />
                    </div>

                    <div className={adminField}>
                      <label htmlFor="admin-pass" className={adminLabel}>
                        Palavra-chave
                      </label>
                      <input
                        id="admin-pass"
                        type="password"
                        className={infoLegacyInput}
                        placeholder="Palavra-chave"
                        value={authPass}
                        onChange={(event) => setAuthPass(event.target.value)}
                      />
                    </div>

                    {authError ? <p className={adminError}>{authError}</p> : null}

                    <button type="submit" className={infoLegacyPrimaryButton}>
                      Entrar
                    </button>

                    <p className={infoLegacyMeta}>
                      Demo local: utilizador <strong>admin</strong> e password{' '}
                      <strong>cultura2026</strong>.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </main>

          <footer className={infoLegacyFooter}>
            <div className={infoLegacyFooterInner}>
              <span>2026 · Instituto Superior Politecnico Gaya</span>
              <span>InfoCultura</span>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className={infoLegacyPage}>
      <header className={infoLegacyHeader}>
        <div className={infoLegacyHeaderInner}>
          <div className={infoLegacyBrandWrap}>
            <img src={ispgayaLogo} alt="ISPGAYA" className={infoLegacyBrandLogo} />
            <div>
              <p className={infoLegacyBrandText}>InfoCultura</p>
              <p className={infoLegacyBrandSub}>Gestao cultural interna</p>
            </div>
          </div>
          <p className={infoLegacyLang}>PT | EN</p>
        </div>
      </header>

      <main className={infoLegacyMain}>
        <div className={container}>
          <div className={adminHeaderRow}>
            <span className={adminBadge}>InfoCultura</span>
            <p className={adminInfo}>Gestao de Tuna, Clube de Leitura e Teatro.</p>
            <button type="button" onClick={handleLogout} className={adminBtnSecondary}>
              Terminar sessao
            </button>
          </div>
          {panelError ? <p className={adminError}>{panelError}</p> : null}

          <form onSubmit={handleSave} className={adminPanelForm}>
            <h2 className={blockTitle}>
              {editingId ? 'Editar Conteudo' : 'Novo Conteudo'}
            </h2>
            <p className={blockText}>
              Cria ou atualiza conteudo para as paginas do Laboratorio Cultural.
            </p>

            <div className={adminFormGridSpaced}>
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

            <div className={adminFieldSpaced}>
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
              <button type="submit" className={adminBtnPrimary} disabled={isSaving}>
                {isSaving ? 'A guardar...' : editingId ? 'Atualizar' : 'Criar'}
              </button>
              <button type="button" onClick={resetForm} className={adminBtnSecondary}>
                Limpar
              </button>
            </div>
          </form>

          <div className={adminList}>
            {isLoadingItems ? (
              <p className={adminInfo}>A carregar conteudos...</p>
            ) : null}
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
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                  >
                    {deletingId === item.id ? 'A apagar...' : 'Apagar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <footer className={infoLegacyFooter}>
        <div className={infoLegacyFooterInner}>
          <span>2026 · Instituto Superior Politecnico Gaya</span>
          <span>InfoCultura</span>
        </div>
      </footer>
    </div>
  );
}

export default AdminCultura;
