import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guía de Tallas - Lukess Home',
}

export default function GuiaTallasPage() {
  return (
    <LegalPageTemplate title="Guía de Tallas" lastUpdated="10 de febrero de 2026">
      <section className="mb-8">
        <h2>Camisas y Polos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Talla</th>
                <th className="border border-gray-300 px-4 py-2">Pecho (cm)</th>
                <th className="border border-gray-300 px-4 py-2">Largo (cm)</th>
                <th className="border border-gray-300 px-4 py-2">Hombro (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">S</td>
                <td className="border border-gray-300 px-4 py-2 text-center">90-95</td>
                <td className="border border-gray-300 px-4 py-2 text-center">68-70</td>
                <td className="border border-gray-300 px-4 py-2 text-center">42-44</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">M</td>
                <td className="border border-gray-300 px-4 py-2 text-center">96-101</td>
                <td className="border border-gray-300 px-4 py-2 text-center">71-73</td>
                <td className="border border-gray-300 px-4 py-2 text-center">45-47</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">L</td>
                <td className="border border-gray-300 px-4 py-2 text-center">102-107</td>
                <td className="border border-gray-300 px-4 py-2 text-center">74-76</td>
                <td className="border border-gray-300 px-4 py-2 text-center">48-50</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">XL</td>
                <td className="border border-gray-300 px-4 py-2 text-center">108-113</td>
                <td className="border border-gray-300 px-4 py-2 text-center">77-79</td>
                <td className="border border-gray-300 px-4 py-2 text-center">51-53</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">XXL</td>
                <td className="border border-gray-300 px-4 py-2 text-center">114-120</td>
                <td className="border border-gray-300 px-4 py-2 text-center">80-82</td>
                <td className="border border-gray-300 px-4 py-2 text-center">54-56</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2>Pantalones y Jeans</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Talla</th>
                <th className="border border-gray-300 px-4 py-2">Cintura (cm)</th>
                <th className="border border-gray-300 px-4 py-2">Cadera (cm)</th>
                <th className="border border-gray-300 px-4 py-2">Largo (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">28</td>
                <td className="border border-gray-300 px-4 py-2 text-center">71-74</td>
                <td className="border border-gray-300 px-4 py-2 text-center">88-91</td>
                <td className="border border-gray-300 px-4 py-2 text-center">102</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">30</td>
                <td className="border border-gray-300 px-4 py-2 text-center">76-79</td>
                <td className="border border-gray-300 px-4 py-2 text-center">93-96</td>
                <td className="border border-gray-300 px-4 py-2 text-center">104</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">32</td>
                <td className="border border-gray-300 px-4 py-2 text-center">81-84</td>
                <td className="border border-gray-300 px-4 py-2 text-center">98-101</td>
                <td className="border border-gray-300 px-4 py-2 text-center">106</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-semibold">34</td>
                <td className="border border-gray-300 px-4 py-2 text-center">86-89</td>
                <td className="border border-gray-300 px-4 py-2 text-center">103-106</td>
                <td className="border border-gray-300 px-4 py-2 text-center">108</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">36</td>
                <td className="border border-gray-300 px-4 py-2 text-center">91-94</td>
                <td className="border border-gray-300 px-4 py-2 text-center">108-111</td>
                <td className="border border-gray-300 px-4 py-2 text-center">110</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2>Consejos para Elegir tu Talla</h2>
        <ul className="space-y-3 text-gray-700">
          <li>📏 <strong>Mide con cinta métrica</strong> sobre ropa ajustada</li>
          <li>👕 <strong>Camisas:</strong> Si estás entre tallas, elige la mayor para mayor comodidad</li>
          <li>👖 <strong>Pantalones:</strong> Considera el tipo de corte (slim fit es más ajustado)</li>
          <li>🤔 <strong>¿Dudas?</strong> Consulta por WhatsApp y te asesoramos personalmente</li>
        </ul>
      </section>

      <section>
        <div className="bg-accent-50 border-2 border-accent-200 rounded-lg p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            ¿Necesitas ayuda con tu talla?
          </h3>
          <p className="text-gray-700 mb-4">
            Nuestro equipo está disponible para asesorarte y ayudarte a elegir la talla perfecta.
          </p>
          <a
            href="https://wa.me/59176020369?text=Hola,%20necesito%20ayuda%20con%20las%20tallas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-whatsapp text-white px-6 py-3 rounded-lg font-semibold hover:bg-whatsapp-dark transition-colors"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </section>
    </LegalPageTemplate>
  )
}
