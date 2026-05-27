import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminBtnPrimary, adminBtnSecondary, adminError, adminInput, adminLabel, adminTextarea } from '../../styles/ui';
const initialFormState = {
    name: '',
    email: '',
    phone: '',
    message: ''
};
function ClubRegistrationModal({ clubName, isOpen, isSubmitting = false, submitError = '', entityLabel = 'clube', kickerLabel = 'Inscricao', helperText = 'Preenche os teus dados para enviar um pedido de inscricao ao clube.', submitLabel = 'Enviar inscricao', onClose, onSubmit }) {
    const [form, setForm] = useState(initialFormState);
    const [localError, setLocalError] = useState('');
    useEffect(() => {
        if (!isOpen) {
            setForm(initialFormState);
            setLocalError('');
            return;
        }
        function handleKeyDown(event) {
            if (event.key === 'Escape' && !isSubmitting) {
                onClose();
            }
        }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isSubmitting, onClose]);
    if (!isOpen) {
        return null;
    }
    async function handleSubmit(event) {
        event.preventDefault();
        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            message: form.message.trim()
        };
        if (!payload.name) {
            setLocalError('O nome e obrigatorio.');
            return;
        }
        if (!payload.email) {
            setLocalError('O email e obrigatorio.');
            return;
        }
        setLocalError('');
        await onSubmit(payload);
    }
    return (_jsx("div", { className: "fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 px-4 py-6", role: "dialog", "aria-modal": "true", "aria-labelledby": "club-registration-title", onClick: () => {
            if (!isSubmitting) {
                onClose();
            }
        }, children: _jsxs("div", { className: "w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl", onClick: (event) => event.stopPropagation(), children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.14em] text-[#dd8609]", children: kickerLabel }), _jsxs("h2", { id: "club-registration-title", className: "mt-2 text-2xl font-semibold text-slate-900", children: ["Inscrever em ", clubName] }), _jsx("p", { className: "mt-2 text-sm leading-6 text-slate-600", children: helperText.replace(/clube/gi, entityLabel) })] }), _jsx("button", { type: "button", className: "rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900", onClick: onClose, disabled: isSubmitting, children: "Fechar" })] }), _jsxs("form", { className: "mt-6 space-y-4", onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: adminLabel, htmlFor: "club-registration-name", children: "Nome" }), _jsx("input", { id: "club-registration-name", className: adminInput, value: form.name, onChange: (event) => setForm((prev) => ({ ...prev, name: event.target.value })) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: adminLabel, htmlFor: "club-registration-email", children: "Email" }), _jsx("input", { id: "club-registration-email", type: "email", className: adminInput, value: form.email, onChange: (event) => setForm((prev) => ({ ...prev, email: event.target.value })) })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: adminLabel, htmlFor: "club-registration-phone", children: "Telefone" }), _jsx("input", { id: "club-registration-phone", className: adminInput, value: form.phone, onChange: (event) => setForm((prev) => ({ ...prev, phone: event.target.value })) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: adminLabel, htmlFor: "club-registration-message", children: "Mensagem" }), _jsx("textarea", { id: "club-registration-message", rows: 4, className: adminTextarea, value: form.message, onChange: (event) => setForm((prev) => ({ ...prev, message: event.target.value })) })] }), localError ? _jsx("p", { className: adminError, children: localError }) : null, submitError ? _jsx("p", { className: adminError, children: submitError }) : null, _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { type: "submit", className: adminBtnPrimary, disabled: isSubmitting, children: isSubmitting ? 'A enviar...' : submitLabel }), _jsx("button", { type: "button", className: adminBtnSecondary, onClick: onClose, disabled: isSubmitting, children: "Cancelar" })] })] })] }) }));
}
export default ClubRegistrationModal;
