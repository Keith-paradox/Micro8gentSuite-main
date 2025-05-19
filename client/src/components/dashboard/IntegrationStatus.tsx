import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export interface Integration {
  id: string;
  name: string;
  description: string;
  iconColor: string;
  icon: React.ReactNode;
  status: "active" | "inactive" | "error";
}

interface IntegrationStatusProps {
  integrations: Integration[];
  onAddIntegration: () => void;
}

const getStatusBadge = (status: Integration["status"]) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "inactive":
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    case "error":
      return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    default:
      return null;
  }
};

const IntegrationStatus = ({ integrations, onAddIntegration }: IntegrationStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Integration Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-10 w-10 ${integration.iconColor} rounded-full flex items-center justify-center`}>
                    {integration.icon}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">{integration.name}</h4>
                    <p className="text-xs text-gray-500">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusBadge(integration.status)}
                </div>
              </div>
            </div>
          ))}
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
            <Button onClick={onAddIntegration}>
              <Plus className="h-5 w-5 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationStatus;
