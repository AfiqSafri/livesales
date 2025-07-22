"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Copy, ExternalLink } from "lucide-react"

export default function SellerProfile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  })

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
    setFormData({
      name: userData.name,
      bio: userData.bio || "",
    })

    // Load seller's products
    const allProducts = JSON.parse(localStorage.getItem("products") || "[]")
    const sellerProducts = allProducts.filter((p: any) => p.sellerId === userData.id)
    setProducts(sellerProducts)
  }, [router])

  const handleSave = () => {
    if (!user) return

    const updatedUser = {
      ...user,
      name: formData.name,
      bio: formData.bio,
    }

    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem("users", JSON.stringify(users))
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }

    setUser(updatedUser)
    setIsEditing(false)
  }

  const copyProfileLink = () => {
    const link = `${window.location.origin}/seller/${user.id}`
    navigator.clipboard.writeText(link)
    alert("Profile link copied to clipboard!")
  }

  const copyProductLink = (productId: string) => {
    const link = `${window.location.origin}/product/${productId}`
    navigator.clipboard.writeText(link)
    alert("Product link copied to clipboard!")
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/seller/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Information</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyProfileLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Profile Link
                  </Button>
                  <Link href={`/seller/${user.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Button>
                  </Link>
                </div>
              </CardTitle>
              <CardDescription>Manage your profile information and bio that buyers will see</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell buyers about yourself and your products..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Name</Label>
                    <p className="text-lg font-semibold">{user.name}</p>
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <p className="text-gray-700">{user.bio || "No bio added yet."}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Product Links</CardTitle>
              <CardDescription>
                Share these links in your bio, social media, or anywhere you want to sell
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-gray-600">No products created yet.</p>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600">${product.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => copyProductLink(product.id)}>
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
                      <div className="mt-2 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                        {`${typeof window !== "undefined" ? window.location.origin : ""}/product/${product.id}`}
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
