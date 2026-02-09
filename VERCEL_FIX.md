# 🔧 SOLUCIÓN: Error en Vercel

## Problema

```
Application error: a client-side exception has occurred while loading lukess-home.vercel.app
```

---

## ✅ SOLUCIÓN PASO A PASO

### 1. Verificar Variables de Entorno en Vercel

1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto: **lukess-home**
3. Ve a **Settings** → **Environment Variables**
4. Verifica que existan estas 3 variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_WHATSAPP_NUMBER
```

### 2. Agregar Variables de Entorno (si no existen)

Haz clic en **Add New** y agrega cada una:

#### Variable 1:
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://lrcggpdgrqltqbxqnjgh.supabase.co
Environment: Production, Preview, Development
```

#### Variable 2:
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyY2dncGRncnFsdHFieHFuamdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1ODQ2NTIsImV4cCI6MjA1MzE2MDY1Mn0.pNVl1gQJxY3k_7_8cJq_1uEuPSVm_6XYkGpQEJB8qzE
Environment: Production, Preview, Development
```

#### Variable 3:
```
Key: NEXT_PUBLIC_WHATSAPP_NUMBER
Value: 59176020369
Environment: Production, Preview, Development
```

### 3. Redeploy

Después de agregar las variables:

1. Ve a **Deployments**
2. Click en los 3 puntos (...) del último deployment
3. Click en **Redeploy**
4. Espera a que termine el build

---

## ⚠️ IMPORTANTE

### Prefijo NEXT_PUBLIC_

Todas las variables **DEBEN** tener el prefijo `NEXT_PUBLIC_` para estar disponibles en el cliente.

```
✅ CORRECTO: NEXT_PUBLIC_SUPABASE_URL
❌ INCORRECTO: SUPABASE_URL
```

### Aplicar a Todos los Ambientes

Asegúrate de seleccionar los 3 ambientes:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 🔍 VERIFICAR QUE FUNCIONE

### 1. Espera a que termine el build
```
Building... → Deploying... → Ready
```

### 2. Abre tu sitio
```
https://lukess-home.vercel.app
```

### 3. Verifica que:
- ✅ La página carga sin errores
- ✅ El catálogo muestra productos
- ✅ El buscador funciona
- ✅ Puedes agregar productos al carrito
- ✅ El checkout abre correctamente

---

## 🐛 SI PERSISTE EL ERROR

### Opción 1: Verificar en Browser Console

1. Abre las DevTools (F12)
2. Ve a la pestaña **Console**
3. Busca el error específico
4. Copia el mensaje completo

### Opción 2: Verificar Build Logs

1. Ve a **Deployments** en Vercel
2. Click en el deployment fallido
3. Ve a **Build Logs**
4. Busca líneas con "Error"

### Opción 3: Verificar Runtime Logs

1. Ve a **Deployments** en Vercel
2. Click en el deployment
3. Ve a **Functions**
4. Busca errores en los logs

---

## 🔄 CAUSA DEL ERROR

El error ocurre porque:

1. **Variables de entorno faltantes:** Supabase necesita las variables para conectarse
2. **Cliente se ejecuta en SSR:** El cliente de Supabase intentaba ejecutarse en el servidor sin las variables

### Solución Implementada:

```typescript
// lib/supabase/client.ts
export function getSupabaseClient() {
  // Solo ejecutar en el cliente
  if (typeof window === 'undefined') {
    throw new Error('Only on client side')
  }
  
  // Lazy loading con singleton
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key)
  }
  
  return supabaseInstance
}
```

**Ventajas:**
- ✅ No se ejecuta durante el build
- ✅ Solo se crea en el navegador
- ✅ Singleton pattern (una instancia)
- ✅ Validación de variables

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de hacer deploy, verifica:

- [ ] Variables de entorno agregadas en Vercel
- [ ] Prefijo `NEXT_PUBLIC_` en todas las variables
- [ ] Variables aplicadas a Production, Preview y Development
- [ ] Build local exitoso (`npm run build`)
- [ ] Servidor local funciona (`npm run dev`)
- [ ] Tablas de Supabase creadas (orders, order_items)
- [ ] Políticas RLS activas
- [ ] Archivo `.env.local` en `.gitignore`

---

## 📞 SOPORTE

Si el problema persiste después de seguir estos pasos:

1. Verifica los logs de Vercel
2. Verifica la consola del navegador
3. Verifica que las tablas de Supabase existan
4. Verifica que las políticas RLS estén activas

---

*Última actualización: 09/02/2026 - 9:00 PM*
