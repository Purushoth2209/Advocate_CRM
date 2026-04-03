import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, ChevronRight, Check } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { mockAdvocates } from '../../data/mockData';

const specializations = ['All', 'Criminal', 'Property', 'Family', 'Corporate', 'Constitutional'];

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function DiscoverAdvocates() {
  const navigate = useNavigate();
  const [activeSpec, setActiveSpec] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = mockAdvocates.filter(a => {
    const matchesSpec = activeSpec === 'All' || a.specialization.some(s => s.toLowerCase().includes(activeSpec.toLowerCase()));
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  if (selected) {
    const adv = mockAdvocates.find(a => a.id === selected);
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
        <Header title={adv.name} showBack />
        <div className="px-4 py-4 space-y-4">
          {/* Profile Header */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl flex-shrink-0">
                {adv.name.split(' ').slice(-1)[0][0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">{adv.name}</h2>
                  {adv.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={11} className="text-gray-400" />
                  <p className="text-xs text-gray-500">{adv.city} · {adv.court}</p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-gray-700">{adv.rating}</span>
                  <span className="text-xs text-gray-400">({adv.reviews} reviews)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specialization</p>
            <div className="flex flex-wrap gap-1.5">
              {adv.specialization.map(s => (
                <Badge key={s} variant="indigo">{s}</Badge>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">About</p>
            <p className="text-sm text-gray-600 leading-relaxed">{adv.bio}</p>
          </Card>

          <Card>
            {[
              { label: 'Experience', value: `${adv.experience} years` },
              { label: 'Languages', value: adv.languages.join(', ') },
              { label: 'Consultation Fee', value: formatCurrency(adv.consultationFee) },
              { label: 'Availability', value: adv.available ? 'Available' : 'Unavailable' },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{row.label}</span>
                <span className={`text-xs font-medium ${row.label === 'Availability' ? (adv.available ? 'text-green-600' : 'text-red-500') : 'text-gray-800'}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </Card>
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" fullWidth>Send Request</Button>
            <Button fullWidth disabled={!adv.available}>Book Consultation</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <Header title="Find an Advocate" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            type="text"
            placeholder="Search by name or city..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Spec Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {specializations.map(spec => (
            <button
              key={spec}
              onClick={() => setActiveSpec(spec)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeSpec === spec
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400">{filtered.length} advocates found</p>

        {/* Advocate Cards */}
        <div className="space-y-3">
          {filtered.map(adv => (
            <Card key={adv.id} onClick={() => setSelected(adv.id)}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-base flex-shrink-0">
                  {adv.name.split(' ').slice(-1)[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-900">{adv.name}</p>
                      {adv.verified && (
                        <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check size={8} className="text-white" />
                        </div>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-gray-400" />
                    <p className="text-xs text-gray-500">{adv.city}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {adv.specialization.slice(0, 2).map(s => (
                      <Badge key={s} variant="indigo" size="xs">{s}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold">{adv.rating}</span>
                      <span className="text-xs text-gray-400">({adv.reviews})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${adv.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {adv.available ? 'Available' : 'Busy'}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">{formatCurrency(adv.consultationFee)}/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
