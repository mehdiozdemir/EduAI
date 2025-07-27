import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import ResponsiveContainer from '../components/ui/ResponsiveContainer';
import ResponsiveGrid from '../components/ui/ResponsiveGrid';
import { ResponsiveTable, ResponsiveTableHeader, ResponsiveTableBody, ResponsiveTableRow, ResponsiveTableCell } from '../components/ui/ResponsiveTable';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export const ResponsiveTestPage: React.FC = () => {
  const { currentBreakpoint, isMobile, isTablet, isDesktop, windowWidth } = useBreakpoint();

  const sampleData = [
    { id: 1, name: 'Mathematics', accuracy: 85, questions: 120, status: 'Excellent' },
    { id: 2, name: 'Physics', accuracy: 72, questions: 95, status: 'Good' },
    { id: 3, name: 'Chemistry', accuracy: 58, questions: 80, status: 'Needs Work' },
    { id: 4, name: 'Biology', accuracy: 91, questions: 110, status: 'Excellent' },
  ];

  return (
    <ResponsiveContainer size="full" padding="md">
      <div className="space-y-8">
        {/* Breakpoint Info */}
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Responsive Design Test</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Current Breakpoint:</strong> {currentBreakpoint}
            </div>
            <div>
              <strong>Window Width:</strong> {windowWidth}px
            </div>
            <div>
              <strong>Is Mobile:</strong> {isMobile ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Is Tablet:</strong> {isTablet ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Is Desktop:</strong> {isDesktop ? 'Yes' : 'No'}
            </div>
          </div>
        </Card>

        {/* Responsive Grid Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Grid Test</h2>
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3, xl: 4 }} gap="md">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Card key={item} className="p-4 bg-blue-50">
                <h3 className="font-medium text-blue-900">Grid Item {item}</h3>
                <p className="text-sm text-blue-700 mt-2">
                  This item adapts to different screen sizes using responsive grid.
                </p>
              </Card>
            ))}
          </ResponsiveGrid>
        </Card>

        {/* Button Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Touch-Friendly Buttons</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="sm" variant="primary">Small Button</Button>
              <Button size="md" variant="secondary">Medium Button</Button>
              <Button size="lg" variant="outline">Large Button</Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="w-full sm:w-auto" variant="primary">Full Width on Mobile</Button>
              <Button className="w-full sm:w-auto" variant="ghost">Responsive Width</Button>
            </div>
          </div>
        </Card>

        {/* Input Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mobile-Optimized Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              helperText="This input prevents zoom on iOS"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone"
            />
          </div>
        </Card>

        {/* Responsive Table Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Table</h2>
          <ResponsiveTable>
            <ResponsiveTableHeader>
              <ResponsiveTableRow>
                <ResponsiveTableCell header>Subject</ResponsiveTableCell>
                <ResponsiveTableCell header>Accuracy</ResponsiveTableCell>
                <ResponsiveTableCell header hideOnMobile>Questions</ResponsiveTableCell>
                <ResponsiveTableCell header>Status</ResponsiveTableCell>
              </ResponsiveTableRow>
            </ResponsiveTableHeader>
            <ResponsiveTableBody>
              {sampleData.map((item) => (
                <ResponsiveTableRow key={item.id}>
                  <ResponsiveTableCell mobileLabel="Subject">
                    <div className="font-medium">{item.name}</div>
                  </ResponsiveTableCell>
                  <ResponsiveTableCell mobileLabel="Accuracy">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${
                            item.accuracy >= 80
                              ? 'bg-green-500'
                              : item.accuracy >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${item.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{item.accuracy}%</span>
                    </div>
                  </ResponsiveTableCell>
                  <ResponsiveTableCell mobileLabel="Questions" hideOnMobile>
                    {item.questions}
                  </ResponsiveTableCell>
                  <ResponsiveTableCell mobileLabel="Status">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.accuracy >= 80
                          ? 'bg-green-100 text-green-800'
                          : item.accuracy >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </ResponsiveTableCell>
                </ResponsiveTableRow>
              ))}
            </ResponsiveTableBody>
          </ResponsiveTable>
        </Card>

        {/* Mobile-Specific Features */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mobile-Specific Features</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Touch Targets</h3>
              <p className="text-sm text-gray-600 mb-3">
                All interactive elements have minimum 44px touch targets on mobile.
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="touch-manipulation min-h-[44px] min-w-[44px] bg-blue-500 text-white rounded-lg px-4 py-2 text-sm">
                  Touch Me
                </button>
                <button className="touch-manipulation min-h-[44px] min-w-[44px] bg-green-500 text-white rounded-lg px-4 py-2 text-sm">
                  Me Too
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Safe Area Support</h3>
              <p className="text-sm text-gray-600">
                The layout respects device safe areas (notches, home indicators).
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Scroll Behavior</h3>
              <p className="text-sm text-gray-600">
                Smooth scrolling with momentum on iOS devices.
              </p>
            </div>
          </div>
        </Card>

        {/* Responsive Typography */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Responsive Heading
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-2">
                This text scales appropriately across different screen sizes.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Mobile:</strong> Smaller text, compact spacing
              </div>
              <div>
                <strong>Desktop:</strong> Larger text, generous spacing
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default ResponsiveTestPage;