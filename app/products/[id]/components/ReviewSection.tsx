"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface Review {
  id: string
  rating: number
  comment: string
  reviewerName: string
  reviewerAvatar?: string
  createdAt: string
  isVerifiedPurchase: boolean
}

interface PagedResponse {
  content: Review[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

interface Props {
  productId: string
}

export default function ReviewSection({ productId }: Props) {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews(0)
  }, [productId])

  const fetchReviews = async (pageNum: number) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/reviews?productId=${productId}&page=${pageNum}&size=5`)
      if (res.ok) {
        const data: PagedResponse = await res.json()
        if (pageNum === 0) {
          setReviews(data.content)
        } else {
          setReviews((prev) => [...prev, ...data.content])
        }
        setHasMore(data.hasNext)
        setPage(pageNum)
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      })

      if (res.status === 401) {
        router.push(`/login?redirect=/products/${productId}`)
        return
      }

      if (res.ok) {
        toast.success("Review submitted successfully!")
        setShowReviewForm(false)
        setRating(5)
        setComment("")
        fetchReviews(0) // Reload reviews
      } else {
        throw new Error("Failed to submit review")
      }
    } catch (error) {
      toast.error("Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowReviewForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Write a Review
        </button>
      </div>

      {/* Reviews List */}
      {loading && page === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={review.reviewerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewerName)}&background=random&size=128`}
                    alt={review.reviewerName}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{review.reviewerName}</h4>
                    {review.isVerifiedPurchase && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={() => fetchReviews(page + 1)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More Reviews"}
            </button>
          )}
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 cursor-pointer transition-colors ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Review *
                </label>
                <textarea
                  id="review-comment"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience with this product..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
