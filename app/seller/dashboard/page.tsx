"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, ExternalLink, Copy, LogOut, User } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  sellerId: string
  createdAt: string
}

export default function SellerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(currentUser)
    if (userData.userType !== "seller") {
      router.push("/buyer/dashboard")
      return
    }

    setUser(userData)

    // Load seller's products
    const allProducts = JSON.parse(localStorage.getItem("products") || "[]")
    const sellerProducts = allProducts.filter((p: Product) => p.sellerId === userData.id)
    setProducts(sellerProducts)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const copyLink = (productId: string) => {
    const link = `${window.location.origin}/product/${productId}`
    navigator.clipboard.writeText(link)
    alert("Product link copied to clipboard!")
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/seller/profile">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Manage your products and track your sales.</p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Products</span>
                <Link href="/seller/create-product">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>Manage your product listings and share links with customers</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven't created any products yet.</p>
                  <Link href="/seller/create-product">
                    <Button>Create Your First Product</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image || "/placeholder.svg?height=60&width=60"}
                          alt={product.name}
                          className="w-15 h-15 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-gray-600 text-sm">{product.description}</p>
                          <p className="font-bold text-green-600">${product.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Active</Badge>
                        <Button variant="outline" size="sm" onClick={() => copyLink(product.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                        <Link href={`/product/${product.id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
