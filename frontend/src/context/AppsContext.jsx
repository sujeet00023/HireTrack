import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AppsContext = createContext(null)

export function AppsProvider({ children }) {
  const [apps, setApps] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)

  const fetchApps = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const { data } = await api.get('/applications', { params })
      setApps(data.data)
      return data
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const { data } = await api.get('/applications/stats')
      setStats(data.data)
      return data.data
    } catch (e) {
      console.error('Stats error', e)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const addApp = useCallback(async (payload) => {
    const { data } = await api.post('/applications', payload)
    setApps(prev => [data.data, ...prev])
    toast.success(`Added ${payload.company}!`)
    fetchStats()
    return data.data
  }, [fetchStats])

  const updateApp = useCallback(async (id, payload) => {
    const { data } = await api.put(`/applications/${id}`, payload)
    setApps(prev => prev.map(a => a._id === id ? data.data : a))
    toast.success('Application updated')
    fetchStats()
    return data.data
  }, [fetchStats])

  const changeStatus = useCallback(async (id, status) => {
    const { data } = await api.patch(`/applications/${id}/status`, { status })
    setApps(prev => prev.map(a => a._id === id ? data.data : a))
    toast.success(`Moved to ${status}`)
    fetchStats()
    return data.data
  }, [fetchStats])

  const deleteApp = useCallback(async (id) => {
    const app = apps.find(a => a._id === id)
    await api.delete(`/applications/${id}`)
    setApps(prev => prev.filter(a => a._id !== id))
    toast.success(`Removed ${app?.company || 'application'}`)
    fetchStats()
  }, [apps, fetchStats])

  const addNote = useCallback(async (id, text) => {
    const { data } = await api.post(`/applications/${id}/notes`, { text })
    setApps(prev => prev.map(a => a._id === id ? data.data : a))
    toast.success('Note added')
    return data.data
  }, [])

  return (
    <AppsContext.Provider value={{
      apps, stats, loading, statsLoading,
      fetchApps, fetchStats, addApp, updateApp,
      changeStatus, deleteApp, addNote
    }}>
      {children}
    </AppsContext.Provider>
  )
}

export const useApps = () => useContext(AppsContext)
