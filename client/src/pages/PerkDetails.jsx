import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Category color schemes with gradient backgrounds and accent colors
const categoryThemes = {
  food: {
    gradient: 'from-orange-50 to-red-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    icon: 'restaurant',
    iconColor: 'text-orange-500',
    accentText: 'text-orange-600'
  },
  tech: {
    gradient: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    icon: 'computer',
    iconColor: 'text-blue-500',
    accentText: 'text-blue-600'
  },
  travel: {
    gradient: 'from-purple-50 to-pink-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    icon: 'flight',
    iconColor: 'text-purple-500',
    accentText: 'text-purple-600'
  },
  fitness: {
    gradient: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
    icon: 'gym',
    iconColor: 'text-green-500',
    accentText: 'text-green-600'
  },
  other: {
    gradient: 'from-gray-50 to-slate-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-800',
    icon: 'giftcard',
    iconColor: 'text-gray-500',
    accentText: 'text-gray-600'
  }
}

export default function PerkDetails() {

  const { perkId } = useParams()
  const navigate = useNavigate()
  const [perk, setPerk] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isCancelled = false

    async function fetchPerk() {
      try {
        const { data } = await api.get(`/perks/${perkId}`)
        const fetchedPerk = data?.perk ?? data
        if (!fetchedPerk) {
          throw new Error('Perk payload missing')
        }
        if (!isCancelled) {
          setPerk(fetchedPerk)
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Failed to load perk details. ' + (err?.response?.data?.message || err.message || ''))
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchPerk()

    return () => {
      isCancelled = true
    }
  }, [perkId])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  if (!perk) {
    return <div className="p-6">Perk not found.</div>
  }
  
  const theme = categoryThemes[perk.category] || categoryThemes.other
  
  return (
    <div className={`min-h-screen p-6 bg-gradient-to-b ${theme.gradient}`}>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-600 hover:text-gray-800"
      >
        &larr; Back
      </button>
      <div className={`max-w-3xl mx-auto bg-white rounded-lg shadow-md border ${theme.border} p-6`}>
        <div className="flex items-center mb-4">
          <span className={`material-icons mr-2 ${theme.iconColor} text-3xl`}>
            {theme.icon}
          </span>
          <h1 className="text-2xl font-bold">{perk.title}</h1>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${theme.badge}`}>
          {perk.category ? perk.category.charAt(0).toUpperCase() + perk.category.slice(1) : 'Other'}
        </span>
        <p className="mb-4 text-gray-700">{perk.description}</p>
        <p className={`font-semibold text-lg ${theme.accentText}`}>
          Discount: {perk.discountPercent}%
        </p>
      </div>
    </div>
  )
 }
