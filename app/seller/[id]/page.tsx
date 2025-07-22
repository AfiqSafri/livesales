"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, ShoppingBag, ExternalLink } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  sellerId: string
  createdAt: string
}

interface Seller {
  id: string
  name: string
  bio: string
  email: string
  userType: string
}

export default function SellerProfilePage() {
  const params = useParams()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const sellerId = params.id as string

    // Load seller info
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const foundSeller = users.find((u: any) => u.id === sellerId && u.userType === "seller")

    if (foundSeller) {
      setSeller(foundSeller)

      // Load seller's products
      const allProducts = JSON.parse(localStorage.getItem("products") || "[]")
      const sellerProducts = allProducts.filter((p: Product) => p.sellerId === sellerId)
      setProducts(sellerProducts)
    }
  }, [params.id])

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Seller Not Found</h2>
            <p className="text-gray-600 mb-4">The seller profile you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{seller.name}</h1>
                  <Badge variant="secondary">Seller</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-gray-700">{seller.bio || "This seller hasn't added a bio yet."}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="h-4 w-4" />
                    {products.length} {products.length === 1 ? "Product" : "Products"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products by {seller.name}</CardTitle>
              <CardDescription>Browse all products from this seller</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">This seller hasn't listed any products yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={product.image || "/placeholder.svg?height=300&width=300"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-green-600">${product.price}</span>
                          <Badge variant="secondary">Available</Badge>
                        </div>
                        <Link href={`/product/${product.id}`} className="block mt-4">
                          <Button className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Product
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
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
