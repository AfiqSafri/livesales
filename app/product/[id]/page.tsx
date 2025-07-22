"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShoppingCart, User, ExternalLink } from "lucide-react"

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
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const productId = params.id as string

    // Load current user
    const user = localStorage.getItem("currentUser")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }

    // Load product
    const products = JSON.parse(localStorage.getItem("products") || "[]")
    const foundProduct = products.find((p: Product) => p.id === productId)

    if (foundProduct) {
      setProduct(foundProduct)

      // Load seller info
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const foundSeller = users.find((u: any) => u.id === foundProduct.sellerId)
      if (foundSeller) {
        setSeller(foundSeller)
      }
    }
  }, [params.id])

  const handlePurchase = () => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    // In a real app, this would integrate with a payment processor
    alert(`Purchase successful! You bought ${product?.name} for $${product?.price}`)
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
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
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div>
            <img
              src={product.image || "/placeholder.svg?height=500&width=500"}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600 text-lg">{product.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-green-600">${product.price}</span>
              <Badge variant="secondary">Available</Badge>
            </div>

            {seller && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Sold by {seller.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{seller.bio || "No bio available."}</p>
                  <Link href={`/seller/${seller.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Seller Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <Button size="lg" className="w-full" onClick={handlePurchase}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Buy Now - ${product.price}
              </Button>

              {!currentUser && (
                <p className="text-sm text-gray-600 text-center">
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>{" "}
                  to purchase this product
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
