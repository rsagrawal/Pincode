import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { googleSheetsClient, CRMData } from "@/integrations/google-sheets/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Check, X, RefreshCw, Search, Filter, Download, Upload, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CRMDataRow extends CRMData {
  id: number;
}

export const CRMDataTable = () => {
  const [data, setData] = useState<CRMDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<CRMData>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [pageSize] = useState(50);
  
  // Filter states
  const [filters, setFilters] = useState({
    state: "",
    district: "",
    pincode: "",
    globalSearch: ""
  });
  
  const [debouncedFilters, setDebouncedFilters] = useState({
    state: "",
    district: "",
    pincode: "",
    globalSearch: ""
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the application.",
    });
    navigate('/login');
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(debouncedFilters).some(filter => filter !== "");

  // Debounce effect for text filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilters({
        state: filters.state === "" ? "" : (filters.state.length >= 3 ? filters.state : ""),
        district: filters.district === "" ? "" : (filters.district.length >= 3 ? filters.district : ""), 
        pincode: filters.pincode === "" ? "" : (filters.pincode.length >= 3 ? filters.pincode : ""),
        globalSearch: filters.globalSearch === "" ? "" : (filters.globalSearch.length >= 3 ? filters.globalSearch : "")
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    setCurrentPage(1);
    fetchData(false);
  }, [debouncedFilters]);

  useEffect(() => {
    fetchData(currentPage === 1);
  }, [currentPage]);

  const totalPages = Math.ceil(totalRows / pageSize);

  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  const fetchData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsFiltering(true);
      }
      
      let query = supabase.from("CRM Data").select("*", { count: 'exact' });
      
      // Apply filters
      if (debouncedFilters.state) {
        query = query.ilike('state', `%${debouncedFilters.state}%`);
      }
      if (debouncedFilters.district) {
        query = query.ilike('district', `%${debouncedFilters.district}%`);
      }
      if (debouncedFilters.pincode) {
        query = query.ilike('pincode', `%${debouncedFilters.pincode}%`);
      }
      if (debouncedFilters.globalSearch) {
        query = query.or(`state.ilike.%${debouncedFilters.globalSearch}%,district.ilike.%${debouncedFilters.globalSearch}%,pincode.ilike.%${debouncedFilters.globalSearch}%`);
      }
      
      const { count } = await query;
      setTotalRows(count || 0);
      
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize - 1;
      
      let dataQuery = supabase.from("CRM Data").select("*");
      
      // Apply same filters to data query
      if (debouncedFilters.state) {
        dataQuery = dataQuery.ilike('state', `%${debouncedFilters.state}%`);
      }
      if (debouncedFilters.district) {
        dataQuery = dataQuery.ilike('district', `%${debouncedFilters.district}%`);
      }
      if (debouncedFilters.pincode) {
        dataQuery = dataQuery.ilike('pincode', `%${debouncedFilters.pincode}%`);
      }
      if (debouncedFilters.globalSearch) {
        dataQuery = dataQuery.or(`state.ilike.%${debouncedFilters.globalSearch}%,district.ilike.%${debouncedFilters.globalSearch}%,pincode.ilike.%${debouncedFilters.globalSearch}%`);
      }
      
      const { data: crmData, error } = await dataQuery
        .range(startIndex, endIndex)
        .order('id', { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      setData(crmData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch CRM data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData(true);
  }, []);

  const syncWithGoogleSheets = async () => {
    try {
      setSyncing(true);
      
      // Fetch data from Google Sheets
      const sheetData = await googleSheetsClient.fetchSheetData();
      
      // Clear existing data
      await supabase.from("CRM Data").delete().neq('id', 0);
      
      // Insert new data
      const { error } = await supabase.from("CRM Data").insert(
        sheetData.map(item => ({
          state: item.state,
          district: item.district,
          pincode: item.pincode,
          hp: item.hp,
          amp: item.amp,
          dsn: item.dsn,
          ssm: item.ssm,
          yltp: item.yltp,
          wltp: item.wltp,
          vtp: item.vtp,
          rural_hp: item.ruralHp,
          rural_amp: item.ruralAmp,
          rhp_legacy: item.rhpLegacy
        }))
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Data synchronized with Google Sheets successfully",
      });

      // Refresh data
      await fetchData(true);
    } catch (error) {
      console.error("Error syncing with Google Sheets:", error);
      toast({
        title: "Error",
        description: "Failed to sync with Google Sheets",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setEditingRow(null);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setEditingRow(null);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setEditingRow(null);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      state: "",
      district: "",
      pincode: "",
      globalSearch: ""
    });
  };

  const handleEdit = (row: CRMDataRow) => {
    setEditingRow(row.id);
    setEditData({
      state: row.state,
      district: row.district,
      pincode: row.pincode,
      hp: row.hp,
      amp: row.amp,
      dsn: row.dsn,
      ssm: row.ssm,
      yltp: row.yltp,
      wltp: row.wltp,
      vtp: row.vtp,
      ruralHp: row.ruralHp,
      ruralAmp: row.ruralAmp,
      rhpLegacy: row.rhpLegacy
    });
  };

  const handleSave = async (row: CRMDataRow) => {
    try {
      const updateData = {
        state: editData.state,
        district: editData.district,
        pincode: editData.pincode,
        hp: editData.hp,
        amp: editData.amp,
        dsn: editData.dsn,
        ssm: editData.ssm,
        yltp: editData.yltp,
        wltp: editData.wltp,
        vtp: editData.vtp,
        rural_hp: editData.ruralHp,
        rural_amp: editData.ruralAmp,
        rhp_legacy: editData.rhpLegacy,
        last_updated: new Date().toISOString()
      };

      // Update database
      const { error: dbError } = await supabase
        .from("CRM Data")
        .update(updateData)
        .eq('id', row.id);

      if (dbError) {
        throw dbError;
      }

      // Update Google Sheets
      const sheetData: CRMData = {
        state: editData.state || '',
        district: editData.district || '',
        pincode: editData.pincode || '',
        hp: editData.hp || 0,
        amp: editData.amp || 0,
        dsn: editData.dsn || 0,
        ssm: editData.ssm || 0,
        yltp: editData.yltp || 0,
        wltp: editData.wltp || 0,
        vtp: editData.vtp || 0,
        ruralHp: editData.ruralHp || 0,
        ruralAmp: editData.ruralAmp || 0,
        rhpLegacy: editData.rhpLegacy || 0
      };

      await googleSheetsClient.updateSheetRow(row.id - 1, sheetData);

      await fetchData();
      setEditingRow(null);
      setEditData({});
      
      toast({
        title: "Success",
        description: "CRM data updated successfully in both database and Google Sheets",
      });
    } catch (error) {
      console.error("Error updating CRM data:", error);
      toast({
        title: "Error", 
        description: "Failed to update CRM data",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading CRM data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">CRM Data Management</h1>
          {isFiltering && (
            <div className="flex items-center gap-2 text-blue-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Filtering...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={syncWithGoogleSheets} 
            disabled={syncing} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <Upload className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? "Syncing..." : "Sync with Google Sheets"}
          </Button>
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button onClick={() => fetchData(true)} disabled={loading || isFiltering} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading || isFiltering ? 'animate-spin' : ''}`} />
            {loading || isFiltering ? "Loading..." : "Refresh Data"}
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="destructive" 
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Global Search */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium mb-1">Global Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search across all fields (min 3 characters)..."
                  value={filters.globalSearch}
                  onChange={(e) => handleFilterChange("globalSearch", e.target.value)}
                  className="pl-10"
                />
              </div>
              {filters.globalSearch.length > 0 && filters.globalSearch.length < 3 && (
                <p className="text-xs text-amber-600 mt-1">Type at least 3 characters to search</p>
              )}
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <Input
                placeholder="Enter state name (min 3 characters)..."
                value={filters.state}
                onChange={(e) => handleFilterChange("state", e.target.value)}
              />
              {filters.state.length > 0 && filters.state.length < 3 && (
                <p className="text-xs text-amber-600 mt-1">Type at least 3 characters to search</p>
              )}
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">District</label>
              <Input
                placeholder="Enter district name (min 3 characters)..."
                value={filters.district}
                onChange={(e) => handleFilterChange("district", e.target.value)}
              />
              {filters.district.length > 0 && filters.district.length < 3 && (
                <p className="text-xs text-amber-600 mt-1">Type at least 3 characters to search</p>
              )}
            </div>

            {/* Pincode Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <Input
                placeholder="Enter pincode (min 3 digits)..."
                value={filters.pincode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleFilterChange("pincode", value);
                }}
                inputMode="numeric"
              />
              {filters.pincode.length > 0 && filters.pincode.length < 3 && (
                <p className="text-xs text-amber-600 mt-1">Type at least 3 digits to search</p>
              )}
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear All Filters
            </Button>
          </div>

          {/* Filter Summary */}
          <div className="mt-2 text-sm text-gray-600">
            {Object.values(filters).some(filter => filter !== "") && (
              <span>
                Active filters: {Object.entries(filters).filter(([_, value]) => value !== "").length} | 
                Showing {totalRows.toLocaleString()} filtered results
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial No.</TableHead>
              <TableHead>State</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Pincode</TableHead>
              <TableHead>HP</TableHead>
              <TableHead>AMP</TableHead>
              <TableHead>DSN</TableHead>
              <TableHead>SSM</TableHead>
              <TableHead>YLTP</TableHead>
              <TableHead>WLTP</TableHead>
              <TableHead>VTP</TableHead>
              <TableHead>Rural HP</TableHead>
              <TableHead>Rural AMP</TableHead>
              <TableHead>RHP Legacy</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.id} className="group">
                <TableCell>{getSerialNumber(index)}</TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      value={editData.state || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-32"
                    />
                  ) : (
                    row.state
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      value={editData.district || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, district: e.target.value }))}
                      className="w-32"
                    />
                  ) : (
                    row.district
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      value={editData.pincode || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-24"
                    />
                  ) : (
                    row.pincode
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.hp || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, hp: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  ) : (
                    `₹${row.hp?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.amp || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, amp: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  ) : (
                    `₹${row.amp?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.dsn || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, dsn: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  ) : (
                    `₹${row.dsn?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.ssm || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, ssm: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  ) : (
                    `₹${row.ssm?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.yltp || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, yltp: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  ) : (
                    `₹${row.yltp?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.wltp || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, wltp: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  ) : (
                    `₹${row.wltp?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.vtp || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, vtp: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  ) : (
                    `₹${row.vtp?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.ruralHp || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, ruralHp: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  ) : (
                    `₹${row.rural_hp?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.ruralAmp || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, ruralAmp: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  ) : (
                    `₹${row.rural_amp?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.rhpLegacy || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, rhpLegacy: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  ) : (
                    `₹${row.rhp_legacy?.toFixed(2) || '0.00'}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(row)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(row)}
                      className="h-8 w-8 p-0"
                      title="Edit Row"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {data.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          No data available
        </div>
      )}
      
      {/* Pagination Summary */}
      {totalRows > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRows)} of {totalRows.toLocaleString()} entries
          </div>
          
          {/* Pagination Controls */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={goToPreviousPage}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <PaginationItem>
                    <PaginationLink onClick={() => goToPage(1)} className="cursor-pointer">
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 4 && <PaginationEllipsis />}
                </>
              )}
              
              {/* Show pages around current page */}
              {(() => {
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, currentPage + 2);
                const pages = [];
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => goToPage(i)}
                        isActive={i === currentPage}
                        className="cursor-pointer"
                      >
                        {i}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                return pages;
              })()}
              
              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <PaginationEllipsis />}
                  <PaginationItem>
                    <PaginationLink onClick={() => goToPage(totalPages)} className="cursor-pointer">
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={goToNextPage}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}; 