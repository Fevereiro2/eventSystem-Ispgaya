import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { footerBottomContainer, footerBottomCopyright, footerBottomGaia, footerBottomInner, footerBottomLink, footerBottomLinks, footerBottomSeparator, footerBottomText, footerBottomUpdated, footerBrand, footerCertIcon, footerCertRow, footerCol, footerContactAddress, footerContactEmail, footerContactHint, footerContactPhone, footerContactStrong, footerFollowTitle, footerGrid, footerLink, footerList, footerListItem, footerLogo, footerSection, footerSocialIcon, footerSocialLink, footerSocialLinks, footerSrOnly, footerSubTitle, footerTitle, footerWrap } from '../../styles/ui';
import iso14001 from '../../assets/ISO-14001.svg';
import iso21001 from '../../assets/ISO-21001.svg';
import iso9001 from '../../assets/ISO-9001.svg';
import gaiaSkyline from '../../assets/gaia-skyline.webp';
import logoNegative from '../../assets/ispgaya-logo-negative.svg';
const ensinoLinks = [
    'CTeSP',
    'Licenciaturas',
    'Mestrados',
    'Pos-Graduacoes',
    'Candidaturas',
    'Bolsas e Financiamento',
    'Programas Avancados'
];
const hubLinks = [
    'Inforestudante',
    'Infordocente',
    'Email',
    'Wi-Fi',
    'Password',
    'Cartao ISPGAYA',
    'Identidade Visual'
];
const interesseLinks = [
    'DGES',
    'A3ES',
    'Ciencia Vitae',
    'Governo de Portugal',
    'Projetos Cofinanciados',
    'Repositorio de Documentos'
];
function Footer() {
    return (_jsxs("footer", { className: footerWrap, children: [_jsxs("section", { className: footerSection, children: [_jsxs("div", { className: footerGrid, children: [_jsxs("div", { className: footerBrand, children: [_jsx("img", { src: logoNegative, width: 175, height: 54, className: footerLogo, alt: "ISPGAYA" }), _jsx("p", { className: footerFollowTitle, children: "Segue-nos" }), _jsxs("div", { className: footerSocialLinks, children: [_jsxs("a", { href: "#", className: footerSocialLink, children: [_jsx("span", { className: footerSrOnly, children: "ISPGAYA Facebook" }), _jsx(Facebook, { className: footerSocialIcon, "aria-hidden": "true" })] }), _jsxs("a", { href: "#", className: footerSocialLink, children: [_jsx("span", { className: footerSrOnly, children: "ISPGAYA Instagram" }), _jsx(Instagram, { className: footerSocialIcon, "aria-hidden": "true" })] }), _jsxs("a", { href: "#", className: footerSocialLink, children: [_jsx("span", { className: footerSrOnly, children: "ISPGAYA LinkedIn" }), _jsx(Linkedin, { className: footerSocialIcon, "aria-hidden": "true" })] })] })] }), _jsxs("div", { className: footerCol, children: [_jsx("p", { className: footerTitle, children: "Ensino" }), _jsx("ul", { className: footerList, children: ensinoLinks.map((item) => (_jsx("li", { className: footerListItem, children: _jsx("a", { href: "#", className: footerLink, children: item }) }, item))) })] }), _jsxs("div", { className: footerCol, children: [_jsx("p", { className: footerTitle, children: "ISPGAYA HUB" }), _jsx("ul", { className: footerList, children: hubLinks.map((item) => (_jsx("li", { className: footerListItem, children: _jsx("a", { href: "#", className: footerLink, children: item }) }, item))) })] }), _jsxs("div", { className: footerCol, children: [_jsx("p", { className: footerSubTitle, children: "Links de Interesse" }), _jsx("ul", { className: footerList, children: interesseLinks.map((item) => (_jsx("li", { className: footerListItem, children: _jsx("a", { href: "#", className: footerLink, children: item }) }, item))) })] }), _jsxs("div", { className: footerCol, children: [_jsx("p", { className: footerTitle, children: "Contactos" }), _jsxs("address", { className: footerContactAddress, children: [_jsx("p", { className: footerContactStrong, children: "Av. dos Descobrimentos, 333" }), _jsx("p", { className: footerContactStrong, children: "4400-103 Santa Marinha - V.N.Gaia" }), _jsxs("p", { className: footerContactPhone, children: ["(+351) 223 745 730 ", _jsx("span", { className: footerContactHint, children: "O valor da chamada corresponde ao valor de uma chamada para a rede fixa, em funcao do seu plano tarifario." })] }), _jsx("p", { className: footerContactEmail, children: "info@ispgaya.pt" })] }), _jsxs("div", { className: footerCertRow, children: [_jsx("img", { className: footerCertIcon, src: iso9001, alt: "ISO 9001", width: 142, height: 155 }), _jsx("img", { className: footerCertIcon, src: iso21001, alt: "ISO 21001", width: 404, height: 446 }), _jsx("img", { className: footerCertIcon, src: iso14001, alt: "ISO 14001", width: 404, height: 446 })] })] })] }), _jsx("div", { className: footerBottomContainer, children: _jsxs("div", { className: footerBottomInner, children: [_jsxs("div", { className: footerBottomText, children: [_jsx("span", { className: footerBottomCopyright, children: "\u00A9 2026 Instituto Superior Politecnico Gaya" }), _jsx("span", { className: footerBottomUpdated, children: "Atualizado em 02/03/2026 - 12:28" })] }), _jsxs("div", { className: footerBottomLinks, children: [_jsx("a", { href: "#", className: footerBottomLink, children: "Termos e Condicoes" }), _jsx("span", { className: footerBottomSeparator, children: "/" }), _jsx("a", { href: "#", className: footerBottomLink, children: "Politica de Privacidade" })] })] }) })] }), _jsx("img", { src: gaiaSkyline, width: 795, height: 140, className: footerBottomGaia, alt: "Vila Nova de Gaia" })] }));
}
export default Footer;
