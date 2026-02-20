import { createClient } from '@/lib/supabase/client'

export const wishlistService = {
  async getWishlist(userId: string): Promise<string[]> {
    const supabase = createClient()
    const { data } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId)
    return data?.map((item: { product_id: string }) => item.product_id) ?? []
  },

  async addToWishlist(userId: string, productId: string): Promise<void> {
    const supabase = createClient()
    await supabase
      .from('wishlists')
      .upsert({ user_id: userId, product_id: productId })
  },

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const supabase = createClient()
    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
  },

  async mergeLocalWishlist(userId: string, localIds: string[]): Promise<string[]> {
    if (localIds.length === 0) return this.getWishlist(userId)

    const supabase = createClient()
    const rows = localIds.map((productId) => ({
      user_id: userId,
      product_id: productId,
    }))

    await supabase
      .from('wishlists')
      .upsert(rows, { ignoreDuplicates: true })

    return this.getWishlist(userId)
  },

  async clearWishlist(userId: string): Promise<void> {
    const supabase = createClient()
    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
  },
}
