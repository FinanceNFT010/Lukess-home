# 🚨 CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

## Problema
Los productos no se muestran en Vercel porque las variables de entorno de Supabase no están configuradas.

## Solución (2 minutos)

### Paso 1: Ir a Vercel
1. Abre: https://vercel.com/finances-projects-6fd84fdb/lukess-home/settings/environment-variables

### Paso 2: Agregar Variables
Agrega estas 3 variables (copia y pega exactamente):

#### Variable 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://lrcggpdgrqltqbxqnjgh.supabase.co`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyY2dncGRncnFsdHFieHFuamdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzgzNjksImV4cCI6MjA4NjA1NDM2OX0.uF3VonuX0pGe3373wS9se_Z97rpb9nCRGWEGA-G1FMI
```
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 3:
- **Name**: `NEXT_PUBLIC_WHATSAPP_NUMBER`
- **Value**: `59176020369`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### Paso 3: Guardar
Click en **"Save"** después de agregar cada variable.

### Paso 4: Redeploy
1. Ve a: https://vercel.com/finances-projects-6fd84fdb/lukess-home/deployments
2. Click en los **3 puntos (⋮)** del último deployment
3. Click en **"Redeploy"**
4. Espera ~30 segundos

### Paso 5: Verificar
Abre https://lukess-home.vercel.app y deberías ver los 36 productos.

---

## ¿Por qué pasa esto?

- `.env.local` solo funciona en desarrollo local
- Vercel necesita las variables configuradas en su dashboard
- Las variables `NEXT_PUBLIC_*` se exponen al cliente (necesario para Supabase)

---

## Captura de pantalla de referencia

```
┌─────────────────────────────────────────────────────────────┐
│  Vercel > lukess-home > Settings > Environment Variables    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  + Add New                                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Name: NEXT_PUBLIC_SUPABASE_URL                      │   │
│  │ Value: https://lrcggpdgrqltqbxqnjgh.supabase.co    │   │
│  │ Environments: [✓] Production [✓] Preview [✓] Dev   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Name: NEXT_PUBLIC_SUPABASE_ANON_KEY                 │   │
│  │ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     │   │
│  │ Environments: [✓] Production [✓] Preview [✓] Dev   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Name: NEXT_PUBLIC_WHATSAPP_NUMBER                   │   │
│  │ Value: 59176020369                                  │   │
│  │ Environments: [✓] Production [✓] Preview [✓] Dev   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                          [Save]             │
└─────────────────────────────────────────────────────────────┘
```

---

## Después de configurar

Una vez que hagas el redeploy, los productos aparecerán automáticamente porque:

1. ✅ El código ya está correcto
2. ✅ La conexión con Supabase funciona (probado en local)
3. ✅ Solo faltaban las variables de entorno en Vercel

---

## Soporte

Si después de seguir estos pasos sigues sin ver productos:

1. Verifica que las variables estén guardadas correctamente
2. Asegúrate de hacer **Redeploy** (no solo guardar las variables)
3. Espera 1-2 minutos después del redeploy
4. Limpia caché del navegador (Ctrl+Shift+R)
