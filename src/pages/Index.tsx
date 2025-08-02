import { RegionMappingTable } from "@/components/RegionMappingTable";
import { Button } from "@/components/ui/button";
import { Database, Table } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tier Edit Hub</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Region Mapping
              </Link>
            </Button>
            <Button asChild>
              <Link to="/crm" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                CRM Data
              </Link>
            </Button>
          </div>
        </div>
        <RegionMappingTable />
      </div>
    </div>
  );
};

export default Index;
