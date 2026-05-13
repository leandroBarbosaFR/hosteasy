import Link from "next/link";
import { LegalPage } from "@/components/landing/legal-page";

export const metadata = {
  title: "Termos de Uso · HostEasy",
};

export default function TermosPage() {
  return (
    <LegalPage
      eyebrow="Documento legal"
      title="Termos de Uso"
      lastUpdated="12 de maio de 2026"
    >
      <p>
        Estes Termos regulam o uso da plataforma <strong>HostEasy</strong>,
        operada por <strong>HostEasy Tecnologia Ltda.</strong>, com sede em
        Florianópolis/SC. Ao contratar o serviço você concorda com tudo o
        que está aqui — leia com calma.
      </p>

      <h2>1. O que é o HostEasy</h2>
      <p>
        O HostEasy é um serviço de assinatura que combina (i) tablet físico
        de 8 polegadas instalado no imóvel, (ii) software de guia digital,
        comunicação e vendas extras e (iii) painel web para o anfitrião
        gerenciar conteúdo, reservas e receita.
      </p>

      <h2>2. Cadastro e conta</h2>
      <p>
        Pra contratar você precisa ser maior de 18 anos, ter CPF ou CNPJ
        válido e fornecer informações verdadeiras no cadastro. Você é
        responsável por manter a confidencialidade da senha e por toda
        atividade realizada na sua conta.
      </p>

      <h2>3. Assinatura, pagamento e cobrança</h2>
      <p>
        A assinatura é cobrada por imóvel ativo, conforme o plano escolhido
        no momento da contratação (mensal ou anual). Os valores vigentes
        estão sempre disponíveis em{" "}
        <Link href="/#precos">hosteasy.com.br/#precos</Link>.
      </p>
      <ul>
        <li>
          <strong>Mensal:</strong> contrato de 12 meses, cobrança mensal via
          Pix, boleto ou cartão de crédito.
        </li>
        <li>
          <strong>Anual:</strong> pagamento à vista no Pix ou em até 12x no
          cartão.
        </li>
        <li>
          Em caso de inadimplência por mais de 15 dias, o serviço pode ser
          suspenso até regularização.
        </li>
      </ul>

      <h2>4. Tablet (hardware)</h2>
      <p>
        O tablet é cedido em comodato pelo período da assinatura. Quebra,
        roubo ou furto sem dolo do anfitrião são cobertos pela garantia
        HostEasy — enviamos uma substituição em até 48h úteis. Uso indevido
        (imersão, modificação de firmware, etc.) pode gerar cobrança do
        valor de reposição.
      </p>
      <p>
        Ao encerrar a assinatura, o anfitrião deve devolver o(s) tablet(s)
        em até 30 dias usando a etiqueta de postagem fornecida.
      </p>

      <h2>5. Conteúdo do anfitrião</h2>
      <p>
        Você é responsável pelo conteúdo que publica no tablet (textos,
        fotos, vídeos, preços de extras, parceiros indicados). O HostEasy
        não modera previamente esse conteúdo, mas pode removê-lo
        sumariamente caso identifique violação à lei, a direitos de
        terceiros ou aos termos das integrações de PMS conectadas.
      </p>

      <h2>6. Vendas extras e comissões</h2>
      <p>
        Pedidos feitos pelo hóspede no tablet (late check-out, café,
        transfer, etc.) são autorizados no cartão do hóspede e repassados
        ao anfitrião conforme o seguinte:
      </p>
      <ul>
        <li>
          <strong>Extras do próprio anfitrião:</strong> 90% para o
          anfitrião, 10% retidos pelo HostEasy.
        </li>
        <li>
          <strong>Parceiros locais (iFood, escolas de surf, etc.):</strong>{" "}
          o anfitrião recebe 20% sobre o valor da transação, repassado no
          fim do mês.
        </li>
      </ul>

      <h2>7. Disponibilidade e suporte</h2>
      <p>
        Nosso compromisso é de 99% de uptime mensal do painel web. Suporte
        em português via WhatsApp e e-mail em horário comercial
        (segunda-sexta, 9h–18h, horário de Brasília).
      </p>

      <h2>8. Cancelamento</h2>
      <p>
        Você pode cancelar a renovação a qualquer momento. Contratos
        anuais não são reembolsados proporcionalmente, mas a assinatura
        continua válida até o fim do ciclo pago. Após o cancelamento, o
        tablet deve ser devolvido conforme item 4.
      </p>

      <h2>9. Limitação de responsabilidade</h2>
      <p>
        O HostEasy não se responsabiliza por danos indiretos, lucros
        cessantes ou prejuízos decorrentes de mau uso pelo hóspede, falhas
        de internet do imóvel ou indisponibilidade de PMS de terceiros. A
        responsabilidade máxima do HostEasy em qualquer hipótese fica
        limitada ao valor pago pelo anfitrião nos últimos 12 meses.
      </p>

      <h2>10. Alterações dos termos</h2>
      <p>
        Podemos alterar estes Termos a qualquer momento. Mudanças
        relevantes serão notificadas por e-mail com 30 dias de antecedência.
        O uso continuado do serviço após esse prazo significa aceite das
        novas condições.
      </p>

      <h2>11. Foro</h2>
      <p>
        Fica eleito o foro da Comarca de Florianópolis/SC para dirimir
        qualquer controvérsia decorrente destes Termos, com renúncia
        expressa a qualquer outro, por mais privilegiado que seja.
      </p>

      <h2>12. Contato</h2>
      <p>
        Dúvidas?{" "}
        <Link href="mailto:leobarbosacontact@gmail.com">
          leobarbosacontact@gmail.com
        </Link>{" "}
        ou pelo{" "}
        <Link href="/contato">WhatsApp da página de contato</Link>.
      </p>
    </LegalPage>
  );
}
