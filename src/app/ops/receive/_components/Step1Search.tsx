'use client'

import { useState } from 'react'
import { useOpsReceive } from '../_context/OpsReceiveContext'
import type { StepComponentProps, SearchResult } from '../_types/wizard.types'
import { CustomerInfoPanel } from './CustomerInfoPanel'
import { CarInfoPanel } from './CarInfoPanel'

export function Step1Search({ onNext, onBack }: StepComponentProps) {
    const { state, updateState } = useOpsReceive()
    const [searchType, setSearchType] = useState<'license' | 'phone' | 'name'>('license')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        setIsLoading(true)
        try {
            const response = await fetch(
                `/api/ops/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`
            )

            if (!response.ok) throw new Error('Search failed')

            const results: SearchResult[] = await response.json()
            updateState({ searchResults: results })
        } catch (error) {
            console.error('Search error:', error)
            alert('เกิดข้อผิดพลาดในการค้นหา')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectResult = (result: SearchResult) => {
        updateState({
            selectedCar: result.car || null,
            selectedCustomer: result.customer || null,
            // Pre-fill mileage if available
            jobInfo: result.car ? {
                ...state.jobInfo,
                mileage: result.car.mileage || 0
            } : state.jobInfo
        })
    }

    const handleNext = () => {
        if (!state.selectedCar || !state.selectedCustomer) {
            alert('กรุณาเลือกรถและลูกค้า')
            return
        }
        onNext()
    }

    return (
        <div className="row">
            {/* Left: Search */}
            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="ti ti-search me-2"></i>ค้นหาลูกค้า/รถ
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">ค้นหาด้วย</label>
                                <select
                                    className="form-select"
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value as any)}
                                >
                                    <option value="license">ทะเบียนรถ</option>
                                    <option value="phone">เบอร์โทรลูกค้า</option>
                                    <option value="name">ชื่อลูกค้า</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">คีย์เวิร์ด</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={
                                            searchType === 'license' ? 'กข-1234' :
                                                searchType === 'phone' ? '081-234-5678' :
                                                    'ชื่อลูกค้า'
                                        }
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSearch}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                        ) : (
                                            <i className="ti ti-search me-1"></i>
                                        )}
                                        ค้นหา
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        {state.searchResults.length > 0 && (
                            <div className="mt-4">
                                <h4>ผลการค้นหา</h4>
                                <div className="list-group list-group-flush">
                                    {state.searchResults.map((result) => (
                                        <a
                                            key={result.id}
                                            href="#"
                                            className={`list-group-item list-group-item-action ${state.selectedCar?.id === result.car?.id ? 'active' : ''
                                                }`}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handleSelectResult(result)
                                            }}
                                        >
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <span className="avatar bg-blue-lt">
                                                        <i className="ti ti-car"></i>
                                                    </span>
                                                </div>
                                                <div className="col">
                                                    <div className="d-flex justify-content-between">
                                                        <strong>{result.car?.licensePlate}</strong>
                                                        <span className="badge bg-blue">
                                                            {result.car?.brand} {result.car?.model}
                                                        </span>
                                                    </div>
                                                    <div className="text-muted">
                                                        {result.customer?.name} | {result.customer?.phone}
                                                    </div>
                                                </div>
                                                <div className="col-auto">
                                                    <i className="ti ti-chevron-right"></i>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {state.searchResults.length === 0 && searchQuery && !isLoading && (
                            <div className="alert alert-warning mt-4">
                                <i className="ti ti-alert-circle me-2"></i>
                                ไม่พบข้อมูล กรุณาลองค้นหาใหม่หรือเพิ่มลูกค้าใหม่
                            </div>
                        )}
                    </div>
                    <div className="card-footer">
                        <div className="d-flex justify-content-between">
                            <a href="#" className="btn btn-outline-primary">
                                <i className="ti ti-user-plus me-1"></i>ลูกค้าใหม่
                            </a>
                            <button
                                className="btn btn-primary"
                                onClick={handleNext}
                                disabled={!state.selectedCar || !state.selectedCustomer}
                            >
                                ต่อไป <i className="ti ti-arrow-right ms-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Preview Panels */}
            <div className="col-lg-4">
                <CustomerInfoPanel customer={state.selectedCustomer} />
                <CarInfoPanel car={state.selectedCar} className="mt-3" />
            </div>
        </div>
    )
}
