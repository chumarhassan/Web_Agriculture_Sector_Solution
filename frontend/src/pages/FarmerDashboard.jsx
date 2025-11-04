import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../utils/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState(user?.region || 'Lahore');

  useEffect(() => {
    fetchItems();
  }, [region, category]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getAll({ region, category });
      setItems(response.data.data.items);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderPriceTrend = (item) => {
    if (!item.latestPrice) return <span className="text-muted">N/A</span>;
    
    // This would ideally compare with previous price
    // For now, just showing the price
    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold">{item.latestPrice} PKR</span>
      </div>
    );
  };

  const renderRow = (item, index) => (
    <tr 
      key={index}
      onClick={() => navigate(`/items/${item._id}`)}
      className="hover:bg-background cursor-pointer transition-colors"
    >
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-text">{item.name}</div>
          <div className="text-sm text-muted capitalize">{item.category}</div>
        </div>
      </td>
      <td className="px-6 py-4 text-muted">
        {item.unit}
      </td>
      <td className="px-6 py-4">
        {renderPriceTrend(item)}
      </td>
      <td className="px-6 py-4 text-muted text-sm">
        {item.priceDate ? new Date(item.priceDate).toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-6 py-4">
        <button className="text-primary hover:underline text-sm">
          View Details →
        </button>
      </td>
    </tr>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-muted">
            Track market prices and get farming advice
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm text-muted mb-1">Your Region</div>
            <div className="text-2xl font-bold text-primary">{region}</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-sm text-muted mb-1">Total Items</div>
            <div className="text-2xl font-bold">{filteredItems.length}</div>
          </Card>
          
          <Card className="p-6">
            <div className="text-sm text-muted mb-1">Categories</div>
            <div className="text-2xl font-bold">
              {[...new Set(items.map(i => i.category))].length}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={20} />
              <input
                type="text"
                placeholder="Search items..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Region */}
            <select
              className="input"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Multan">Multan</option>
              <option value="Faisalabad">Faisalabad</option>
            </select>

            {/* Category */}
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="vegetable">Vegetables</option>
              <option value="fruit">Fruits</option>
              <option value="grain">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="livestock">Livestock</option>
            </select>
          </div>
        </Card>

        {/* Items Table */}
        <Card>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted">Loading items...</p>
            </div>
          ) : (
            <Table
              headers={['Item', 'Unit', 'Current Price', 'Last Updated', 'Actions']}
              data={filteredItems}
              renderRow={renderRow}
              emptyMessage="No items found. Try adjusting your filters."
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default FarmerDashboard;
