import { createClient } from '@/lib/supabase/server'

export default async function TestProductos() {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(10)
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>TEST DE PRODUCTOS</h1>
      
      {error && (
        <div style={{ background: 'red', color: 'white', padding: '10px', marginBottom: '20px' }}>
          <strong>ERROR:</strong> {JSON.stringify(error, null, 2)}
        </div>
      )}
      
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
        <strong>Total productos:</strong> {products?.length || 0}
      </div>
      
      {products && products.length > 0 ? (
        <div>
          <h2>Productos encontrados:</h2>
          <ul>
            {products.map((p: any) => (
              <li key={p.id}>
                {p.name} - Bs {p.price} - Stock: {p.is_active ? 'Activo' : 'Inactivo'}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{ background: 'yellow', padding: '10px' }}>
          No se encontraron productos
        </div>
      )}
      
      <hr />
      
      <div style={{ marginTop: '20px', fontSize: '12px' }}>
        <strong>Environment Variables:</strong>
        <ul>
          <li>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada'}</li>
          <li>SUPABASE_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada'}</li>
        </ul>
      </div>
    </div>
  )
}
