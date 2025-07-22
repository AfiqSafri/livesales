import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Store, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">MarketPlace</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Marketplace for Everyone</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sell your products with shareable links or discover amazing items from sellers around the world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center">
              <Store className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">For Sellers</CardTitle>
              <CardDescription>Create products and share links with your customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-gray-600">
                <li>• Create product listings easily</li>
                <li>• Get shareable links for each product</li>
                <li>• Add links to your bio or social media</li>
                <li>• Track your sales and customers</li>
              </ul>
              <Link href="/register?type=seller" className="block">
                <Button className="w-full">Start Selling</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-colors">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">For Buyers</CardTitle>
              <CardDescription>Discover and purchase products from sellers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-gray-600">
                <li>• Browse products from sellers</li>
                <li>• Click links from seller bios</li>
                <li>• Secure and easy purchasing</li>
                <li>• Track your orders</li>
              </ul>
              <Link href="/register?type=buyer" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Create Account</h4>
              <p className="text-gray-600">Sign up as a seller or buyer</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">List or Browse</h4>
              <p className="text-gray-600">Sellers create products, buyers browse</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">Share & Buy</h4>
              <p className="text-gray-600">Share links and make purchases</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
