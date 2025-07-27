import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { ResponsiveContainer, ResponsiveGrid, Card, Button, Input } from '../components/ui';

export const ResponsiveDemo: React.FC = () => {
  const { currentBreakpoint, windowWidth, isMobile, isTablet } = useBreakpoint();

  return (
    <ResponsiveContainer maxWidth="full" padding="lg">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Responsive Design Demo
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Testing responsive breakpoints and mobile optimization
          </p>
        </div>

        {/* Breakpoint Info */}
        <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-4">
            Current Breakpoint Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Breakpoint:</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-900">
                {currentBreakpoint}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Width:</span>
              <span className="ml-2 text-blue-900">{windowWidth}px</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Device Type:</span>
              <span className="ml-2 text-blue-900">
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Touch Optimized:</span>
              <span className="ml-2 text-blue-900">
                {isMobile || isTablet ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </Card>

        {/* Responsive Grid Demo */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Responsive Grid System
          </h2>
          
          <div className="space-y-6">
            {/* 1 Column on Mobile, 2 on Tablet, 3 on Desktop */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                1 → 2 → 3 Columns
              </h3>
              <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i} className="p-4 text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <h4 className="font-medium text-gray-900">Item {i + 1}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Responsive grid item
                    </p>
                  </Card>
                ))}
              </ResponsiveGrid>
            </div>

            {/* 2 Column on Mobile, 3 on Tablet, 4 on Desktop */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                2 → 3 → 4 Columns
              </h3>
              <ResponsiveGrid cols={{ mobile: 2, tablet: 3, desktop: 4 }} gap="sm">
                {Array.from({ length: 8 }, (_, i) => (
                  <Card key={i} className="p-3 text-center">
                    <div className="text-lg mb-1">🎯</div>
                    <h4 className="text-sm font-medium text-gray-900">Card {i + 1}</h4>
                  </Card>
                ))}
              </ResponsiveGrid>
            </div>
          </div>
        </div>

        {/* Touch-Friendly Buttons */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Touch-Friendly Buttons
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button variant="primary" size="sm">
                Small Button
              </Button>
              <Button variant="primary" size="md">
                Medium Button
              </Button>
              <Button variant="primary" size="lg">
                Large Button
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button variant="outline" className="w-full sm:w-auto">
                Full Width on Mobile
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto">
                Responsive Width
              </Button>
            </div>
          </div>
        </div>

        {/* Responsive Forms */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Responsive Forms
          </h2>
          
          <Card className="p-4 sm:p-6">
            <form className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="Enter your first name"
                />
                <Input
                  label="Last Name"
                  placeholder="Enter your last name"
                />
              </div>
              
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  placeholder="City"
                />
                <Input
                  label="State"
                  placeholder="State"
                />
                <Input
                  label="ZIP Code"
                  placeholder="ZIP"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Button type="submit" variant="primary" className="w-full sm:w-auto">
                  Submit Form
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Responsive Typography */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Responsive Typography
          </h2>
          
          <Card className="p-4 sm:p-6 space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Responsive Heading 1
            </h1>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800">
              Responsive Heading 2
            </h2>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-700">
              Responsive Heading 3
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
              This is responsive body text that scales appropriately across different screen sizes. 
              On mobile devices, it uses smaller font sizes for better readability, while on larger 
              screens it increases in size for improved visual hierarchy.
            </p>
          </Card>
        </div>

        {/* Mobile-Specific Features */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Mobile-Specific Features
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Touch Targets
              </h3>
              <div className="space-y-3">
                <button className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg text-left touch-manipulation min-h-[48px] hover:bg-blue-100 active:bg-blue-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-900">Touch-friendly button</span>
                    <span className="text-blue-600">→</span>
                  </div>
                </button>
                <button className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-left touch-manipulation min-h-[48px] hover:bg-green-100 active:bg-green-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-900">44px minimum height</span>
                    <span className="text-green-600">✓</span>
                  </div>
                </button>
              </div>
            </Card>
            
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Responsive Spacing
              </h3>
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <div className="p-2 sm:p-3 lg:p-4 bg-gray-100 rounded">
                  <span className="text-sm text-gray-700">Responsive padding</span>
                </div>
                <div className="p-2 sm:p-3 lg:p-4 bg-gray-100 rounded">
                  <span className="text-sm text-gray-700">Scales with screen size</span>
                </div>
                <div className="p-2 sm:p-3 lg:p-4 bg-gray-100 rounded">
                  <span className="text-sm text-gray-700">Mobile optimized</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Responsive Table */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Responsive Table
          </h2>
          
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                      Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                      Email
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                      Role
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 5 }, (_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sm:px-6">
                        User {i + 1}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 sm:px-6">
                        user{i + 1}@example.com
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 sm:px-6">
                        {i % 2 === 0 ? 'Admin' : 'User'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          i % 2 === 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {i % 2 === 0 ? 'Active' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default ResponsiveDemo;