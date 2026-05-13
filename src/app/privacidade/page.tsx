import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata = {
  title: "Política de Privacidade · HostEasy",
};

export default function PrivacidadePage() {
  return (
    <LegalPage
      eyebrow="Documento legal"
      title="Política de Privacidade"
      lastUpdated="12 de maio de 2026"
    >
      <p>
        A <strong>HostEasy Tecnologia Ltda.</strong> respeita sua privacidade
        e trata seus dados pessoais de acordo com a Lei Geral de Proteção de
        Dados (LGPD — Lei nº 13.709/2018). Aqui explicamos quais dados
        coletamos, como usamos e quais são seus direitos.
      </p>

      <h2>1. Dados que coletamos</h2>
      <p>
        <strong>Do anfitrião:</strong> nome, e-mail, telefone, CPF/CNPJ,
        endereço de cobrança, dados bancários para repasse, endereço dos
        imóveis e conteúdo que você publica no tablet.
      </p>
      <p>
        <strong>Do hóspede (via tablet):</strong> nome (quando informado),
        idioma escolhido, interações com o conteúdo (cliques, tempo de tela,
        extras solicitados) e mensagens trocadas com o anfitrião. Dados de
        pagamento (cartão) são processados diretamente pela operadora e{" "}
        <strong>não ficam armazenados</strong> no HostEasy.
      </p>
      <p>
        <strong>Automaticamente:</strong> dados técnicos (endereço IP,
        identificador do tablet, versão do app), cookies essenciais do
        painel web e métricas de uso anonimizadas.
      </p>

      <h2>2. Como usamos os dados</h2>
      <ul>
        <li>Operar o serviço (sincronizar reservas, mostrar conteúdo certo pro hóspede certo).</li>
        <li>Cobrar a assinatura e repassar comissões.</li>
        <li>Treinar a IA que prioriza ofertas e respostas — somente com dados agregados e anonimizados.</li>
        <li>Atender solicitações de suporte.</li>
        <li>Cumprir obrigações legais (fiscais, regulatórias).</li>
      </ul>

      <h2>3. Compartilhamento</h2>
      <p>
        Compartilhamos dados apenas com quem é necessário pro serviço
        funcionar:
      </p>
      <ul>
        <li>
          <strong>Provedores de pagamento</strong> (Stripe, Pix dos bancos
          parceiros) para processar transações.
        </li>
        <li>
          <strong>Sistemas de PMS</strong> (Stays, Hostaway, Airbnb, etc.)
          conectados por você, conforme as integrações que você ativa.
        </li>
        <li>
          <strong>Parceiros locais</strong> (iFood, restaurantes, passeios)
          quando o hóspede compra algo deles pelo tablet — apenas dados
          necessários pra entrega.
        </li>
        <li>
          <strong>Provedores de infraestrutura</strong> (Vercel, AWS) que
          hospedam o serviço sob contratos de confidencialidade.
        </li>
      </ul>
      <p>
        <strong>Nunca vendemos dados.</strong>
      </p>

      <h2>4. Seus direitos (LGPD)</h2>
      <p>Você pode, a qualquer momento, solicitar:</p>
      <ul>
        <li>Confirmação de tratamento e acesso aos seus dados</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
        <li>Portabilidade dos dados</li>
        <li>Eliminação dos dados tratados com seu consentimento</li>
        <li>Revogação do consentimento</li>
      </ul>
      <p>
        Pra exercer esses direitos, escreva pra{" "}
        <Link href="mailto:leobarbosacontact@gmail.com">
          leobarbosacontact@gmail.com
        </Link>{" "}
        com o assunto &ldquo;LGPD&rdquo;. Respondemos em até 15 dias.
      </p>

      <h2>5. Cookies</h2>
      <p>
        Usamos apenas cookies essenciais no painel web (sessão de login,
        preferências de idioma). Não usamos cookies de marketing ou
        rastreamento de terceiros.
      </p>

      <h2>6. Segurança</h2>
      <p>
        Os dados ficam em servidores no Brasil (AWS São Paulo), com
        criptografia em trânsito (TLS 1.3) e em repouso (AES-256). Acesso
        interno é restrito por papel e auditado.
      </p>

      <h2>7. Retenção</h2>
      <p>
        Mantemos seus dados enquanto a conta estiver ativa e por até 5 anos
        após o encerramento, para cumprir obrigações fiscais. Dados de
        hóspede são anonimizados 12 meses após o fim da estadia.
      </p>

      <h2>8. Crianças</h2>
      <p>
        O HostEasy não é destinado a menores de 18 anos. Se descobrirmos
        que dados de uma criança foram coletados, eles serão eliminados.
      </p>

      <h2>9. Alterações</h2>
      <p>
        Esta Política pode ser atualizada. Mudanças relevantes serão
        notificadas por e-mail com 30 dias de antecedência.
      </p>

      <h2>10. Encarregado de Dados (DPO)</h2>
      <p>
        <strong>Leandro Barbosa</strong> — co-fundador e Encarregado pelo
        Tratamento de Dados Pessoais.{" "}
        <Link href="mailto:leobarbosacontact@gmail.com">
          leobarbosacontact@gmail.com
        </Link>
      </p>
    </LegalPage>
  );
}
