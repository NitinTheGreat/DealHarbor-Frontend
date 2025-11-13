import Link from "next/link"
import Image from "next/image"
import { Star, ShieldCheck, ExternalLink } from "lucide-react"

const badgeColors = {
  BRONZE: "bg-orange-100 text-orange-800",
  SILVER: "bg-gray-100 text-gray-800",
  GOLD: "bg-yellow-100 text-yellow-800",
  PLATINUM: "bg-purple-100 text-purple-800",
}

interface Props {
  seller: {
    id: string
    name: string
    badge: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
    rating: number
    isVerified: boolean
  }
}

export default function SellerCard({ seller }: Props) {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=random&size=128`

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
      
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={avatarUrl}
            alt={seller.name}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 truncate">{seller.name}</h4>
            {seller.isVerified && (
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" aria-label="Verified Student" />
            )}
          </div>
          
          {seller.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{seller.rating.toFixed(1)}</span>
            </div>
          )}
          
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${badgeColors[seller.badge]}`}>
            {seller.badge}
          </span>
        </div>
      </div>
      
      <Link
        href={`/sellers/${seller.id}`}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
      >
        View Profile
        <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  )
}
