import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import RequestsTable from '../components/Requests/RunsTable';
import { RequestData } from '../services/requestService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DateSummary {
  date: string;
  totalRuns: number;
  totalRunsCompleted: number;
  totalAmount: number;
  totalAmountCompleted: number;
}

interface Client {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
  client_id: number;
}

interface Run {
  id: number;
  pickup_location: string;
  delivery_location: string;
  price: number;
  pickup_date: string;
}

const DailyRuns: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { date } = useParams<{ date: string }>();
  const [error, setError] = useState<string | null>(null);
  const [dateSummaries, setDateSummaries] = useState<DateSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [clients, setClients] = useState<Client[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | ''>('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchBranches(selectedClient);
    } else {
      setBranches([]);
      setSelectedBranch('');
    }
  }, [selectedClient]);

  useEffect(() => {
    if (user?.id) {
      setSelectedBranch(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDateSummaries();
  }, [selectedYear, selectedMonth, selectedClient, selectedBranch]);

  useEffect(() => {
    const fetchRuns = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (date) {
          const dateOnly = date.split('T')[0];
          params.append('pickupDate', dateOnly);
        }
        if (user?.id) params.append('branchId', user.id.toString());
        const response = await api.get(`/requests?${params.toString()}`);
        setRuns(response.data);
      } catch (err) {
        setError('Failed to fetch runs for this date');
      } finally {
        setLoading(false);
      }
    };
    if (date) fetchRuns();
  }, [date, user?.id]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchBranches = async (clientId: number) => {
    try {
      const response = await api.get(`/clients/${clientId}/branches`);
      setBranches(response.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchDateSummaries = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        month: selectedMonth.toString()
      });
      if (user?.id) {
        params.append('branchId', user.id.toString());
      } else if (selectedBranch) {
        params.append('branchId', selectedBranch.toString());
      }
      if (selectedClient) {
        params.append('clientId', selectedClient.toString());
      }
      const response = await api.get(`/runs/summaries?${params.toString()}`);
      setDateSummaries(response.data);
    } catch (err) {
      setError('Failed to fetch run summaries');
      console.error('Error fetching date summaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate year options (current year and 5 years back)
  const yearOptions = Array.from({ length: 2 }, (_, i) => new Date().getFullYear() - i);
  
  // Generate month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const chartData = {
    labels: dateSummaries.map(summary => formatDate(summary.date)),
    datasets: [
      {
        label: 'Total Runs',
        data: dateSummaries.map(summary => summary.totalRuns),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Total Amount',
        data: dateSummaries.map(summary => Number(summary.totalAmount || 0)),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Runs and Revenue Summary'
      },
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Number of Runs'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Amount ()'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Runs Summary</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value ? Number(e.target.value) : '')}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            hidden
          >
            <option value="">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : '')}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            disabled={!selectedClient}
            hidden
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            {monthOptions.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <button
            onClick={fetchDateSummaries}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Reset
          </button>

          <a
            href="/dashboard/runs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-gren-700"
          >
            Daily Reports
          </a>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Runs (All)</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {dateSummaries.reduce((sum, summary) => sum + Number(summary.totalRuns || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Amount (All Runs)</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {dateSummaries.reduce((sum, summary) => sum + Number(summary.totalAmount || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'table'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            hidden
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'graph'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            hidden
          >
            Graph View
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Runs
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dateSummaries.map((summary) => (
                <tr key={summary.date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer text-blue-600 hover:underline" onClick={() => navigate(`/dashboard/runs/${encodeURIComponent(summary.date)}`)}>
                    {formatDate(summary.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {summary.totalRuns}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Number(summary.totalAmount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
              {dateSummaries.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No run history available for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <Line options={chartOptions} data={chartData} />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 mt-6">Runs for {date}</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charges</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {runs.map(run => (
              <tr key={run.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{run.pickup_location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{run.delivery_location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{run.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{run.pickup_date}</td>
              </tr>
            ))}
            {runs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No runs for this date</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DailyRuns;

export const RunsForDatePage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const { user } = useAuth();
  const [runs, setRuns] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    const fetchRuns = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (date) {
          const dateOnly = date.split('T')[0];
          params.append('pickupDate', dateOnly);
        }
        if (user?.id) params.append('branchId', user.id.toString());
        const response = await api.get(`/requests?${params.toString()}`);
        setRuns(response.data);
      } catch (err) {
        setError('Failed to fetch runs for this date');
      } finally {
        setLoading(false);
      }
    };
    fetchRuns();
  }, [date, user?.id]);

  const handleRequestClick = (requestId: number) => {
    // Handle request click - you can add navigation or modal here
    console.log('Request clicked:', requestId);
  };

  if (!date) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Runs for {date}</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <RequestsTable 
          requests={runs} 
          onRequestClick={handleRequestClick}
        />
      )}
    </div>
  );
}; 