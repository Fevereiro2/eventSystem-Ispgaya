import { FormEvent, useMemo, useState } from 'react';
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
                    <h3 className={infoLegacyBlockTitle}>Bem-vindo ao InfoCultura</h3>
                    <p className={infoLegacyBlockText}>
                      Plataforma de apoio ao Laboratorio Cultural para registo e publicacao de
                      atividades da Tuna Academica, Clube de Leitura e Teatro.
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
