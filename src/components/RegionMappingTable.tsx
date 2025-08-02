
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Check, X, RefreshCw, Search, Filter, LogOut } from "lucide-react";
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

interface RegionMappingData {
  "S.No.": number;
  "State Code": number;
  "District Code": number;
  "SubDistrict Code": number;
  "Village Code": number;
  "Pincode": number;
  "SubDistrict Name": string;
  "State Name": string;
  "Tier": string;
  "District Name": string;
  "Village Name": string;
}

export const RegionMappingTable = () => {
  const [data, setData] = useState<RegionMappingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [pageSize] = useState(50); // Number of rows per page
  
  // Filter states
  const [filters, setFilters] = useState({
    stateName: "",
    districtName: "",
    pincode: "",
    tier: "",
    globalSearch: ""
  });
  
  // Debounced filter states (for actual API calls)
  const [debouncedFilters, setDebouncedFilters] = useState({
    stateName: "",
    districtName: "",
    pincode: "",
    tier: "",
    globalSearch: ""
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Complete list of Indian states and union territories
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh", 
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    // Union Territories
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
  ];
  
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
        stateName: filters.stateName === "" ? "" : (filters.stateName.length >= 3 ? filters.stateName : ""),
        districtName: filters.districtName === "" ? "" : (filters.districtName.length >= 3 ? filters.districtName : ""), 
        pincode: filters.pincode === "" ? "" : (filters.pincode.length >= 3 ? filters.pincode : ""),
        tier: filters.tier, // No debounce for select dropdown
        globalSearch: filters.globalSearch === "" ? "" : (filters.globalSearch.length >= 3 ? filters.globalSearch : "")
      });
      
      // Debug logging
      console.log("Filters:", filters);
      console.log("Setting debouncedFilters to:", {
        stateName: filters.stateName === "" ? "" : (filters.stateName.length >= 3 ? filters.stateName : ""),
        districtName: filters.districtName === "" ? "" : (filters.districtName.length >= 3 ? filters.districtName : ""), 
        pincode: filters.pincode === "" ? "" : (filters.pincode.length >= 3 ? filters.pincode : ""),
        tier: filters.tier,
        globalSearch: filters.globalSearch === "" ? "" : (filters.globalSearch.length >= 3 ? filters.globalSearch : "")
      });
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchData(false); // This is filtering, not initial load
  }, [debouncedFilters]);

  useEffect(() => {
    fetchData(currentPage === 1); // Initial load if first page, pagination otherwise
  }, [currentPage]);

  const totalPages = Math.ceil(totalRows / pageSize);

  // Function to get serial number for display
  const getSerialNumber = (index: number) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  const fetchData = async (isInitialLoad = false) => {
    try {
      // Show full loading screen only on initial load, use filtering indicator for subsequent requests
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsFiltering(true);
      }
      
      // Debug: Log the debounced filters being used
      console.log("fetchData called with debouncedFilters:", debouncedFilters);
      
      // Build query with filters
      let query = supabase.from("Region Mapping").select("*", { count: 'exact' });
      
      // Apply filters
      if (debouncedFilters.stateName) {
        console.log("Applying state filter:", debouncedFilters.stateName);
        query = query.ilike('"State Name"', `%${debouncedFilters.stateName}%`);
      }
      if (debouncedFilters.districtName) {
        console.log("Applying district filter:", debouncedFilters.districtName);
        query = query.ilike('"District Name"', `%${debouncedFilters.districtName}%`);
      }
      if (debouncedFilters.pincode) {
        console.log("Applying pincode filter:", debouncedFilters.pincode);
        // For int8 pincode, check if it's a complete pincode or partial
        const pincodeNumber = parseInt(debouncedFilters.pincode);
        if (!isNaN(pincodeNumber)) {
          if (debouncedFilters.pincode.length === 6) {
            // Exact match for complete pincode
            query = query.eq('Pincode', pincodeNumber);
          } else {
            // For partial pincode, use starts-with logic through range filtering
            const multiplier = Math.pow(10, 6 - debouncedFilters.pincode.length);
            const startRange = pincodeNumber * multiplier;
            const endRange = startRange + multiplier - 1;
            query = query.gte('Pincode', startRange).lte('Pincode', endRange);
          }
        }
      }
      if (debouncedFilters.tier) {
        console.log("Applying tier filter:", debouncedFilters.tier);
        if (debouncedFilters.tier === "null") {
          // Filter for null/empty tier values
          query = query.is('Tier', null);
        } else {
          // Use exact match for tier filtering since it's a dropdown selection
          query = query.eq('Tier', debouncedFilters.tier);
        }
      }
      if (debouncedFilters.globalSearch) {
        console.log("Applying global search filter:", debouncedFilters.globalSearch);
        query = query.or(`"State Name".ilike.%${debouncedFilters.globalSearch}%,"District Name".ilike.%${debouncedFilters.globalSearch}%,"SubDistrict Name".ilike.%${debouncedFilters.globalSearch}%,"Village Name".ilike.%${debouncedFilters.globalSearch}%`);
      }
      
      // Get total count with filters
      const { count } = await query;
      setTotalRows(count || 0);
      console.log("Filtered rows:", count);
      
      // Calculate range for current page
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize - 1;
      
      console.log(`Fetching page ${currentPage}: rows ${startIndex} to ${endIndex}`);
      
      // Rebuild query for actual data fetch (count query doesn't return data)
      let dataQuery = supabase.from("Region Mapping").select("*");
      
      // Apply same filters to data query
      if (debouncedFilters.stateName) {
        dataQuery = dataQuery.ilike('"State Name"', `%${debouncedFilters.stateName}%`);
      }
      if (debouncedFilters.districtName) {
        dataQuery = dataQuery.ilike('"District Name"', `%${debouncedFilters.districtName}%`);
      }
      if (debouncedFilters.pincode) {
        // For int8 pincode, check if it's a complete pincode or partial
        const pincodeNumber = parseInt(debouncedFilters.pincode);
        if (!isNaN(pincodeNumber)) {
          if (debouncedFilters.pincode.length === 6) {
            // Exact match for complete pincode
            dataQuery = dataQuery.eq('Pincode', pincodeNumber);
          } else {
            // For partial pincode, use starts-with logic through range filtering
            const multiplier = Math.pow(10, 6 - debouncedFilters.pincode.length);
            const startRange = pincodeNumber * multiplier;
            const endRange = startRange + multiplier - 1;
            dataQuery = dataQuery.gte('Pincode', startRange).lte('Pincode', endRange);
          }
        }
      }
      if (debouncedFilters.tier) {
        if (debouncedFilters.tier === "null") {
          // Filter for null/empty tier values
          dataQuery = dataQuery.is('Tier', null);
        } else {
          // Use exact match for tier filtering since it's a dropdown selection
          dataQuery = dataQuery.eq('Tier', debouncedFilters.tier);
        }
      }
      if (debouncedFilters.globalSearch) {
        dataQuery = dataQuery.or(`"State Name".ilike.%${debouncedFilters.globalSearch}%,"District Name".ilike.%${debouncedFilters.globalSearch}%,"SubDistrict Name".ilike.%${debouncedFilters.globalSearch}%,"Village Name".ilike.%${debouncedFilters.globalSearch}%`);
      }
      
      // Fetch only the current page data with filters
      const { data: regionData, error } = await dataQuery
        .range(startIndex, endIndex)
        .order('"S.No."', { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Fetched data:", regionData?.length, "rows for page", currentPage);
      setData(regionData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch region mapping data",
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

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setEditingRow(null); // Cancel any editing when changing pages
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
      stateName: "",
      districtName: "",
      pincode: "",
      tier: "",
      globalSearch: ""
    });
  };

  const handleEdit = (index: number, currentTier: string) => {
    setEditingRow(index);
    setEditValue(currentTier || "");
  };

  const handleSave = async (row: RegionMappingData) => {
    try {
      console.log("Updating tier for S.No.:", row["S.No."], "to:", editValue);
      
      const { error } = await supabase
        .from("Region Mapping")
        .update({ Tier: editValue })
        .eq('"S.No."', row["S.No."]);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      console.log("Update successful, refreshing data...");
      
      // Refresh data from database to ensure consistency
      await fetchData();

      setEditingRow(null);
      setEditValue("");
      
      toast({
        title: "Success",
        description: "Tier updated successfully",
      });
    } catch (error) {
      console.error("Error updating tier:", error);
      toast({
        title: "Error", 
        description: "Failed to update tier",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditValue("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading region mapping data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Region Mapping Data</h1>
          {isFiltering && (
            <div className="flex items-center gap-2 text-blue-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Filtering...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
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

            {/* State Name Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">State Name</label>
              <Select value={filters.stateName === "" ? "all" : filters.stateName} onValueChange={(value) => handleFilterChange("stateName", value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">All States</SelectItem>
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Name Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">District Name</label>
              <Input
                placeholder="Enter district name (min 3 characters)..."
                value={filters.districtName}
                onChange={(e) => handleFilterChange("districtName", e.target.value)}
              />
              {filters.districtName.length > 0 && filters.districtName.length < 3 && (
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
                  // Only allow numeric input for pincode
                  const value = e.target.value.replace(/\D/g, '');
                  handleFilterChange("pincode", value);
                }}
                inputMode="numeric"
              />
              {filters.pincode.length > 0 && filters.pincode.length < 3 && (
                <p className="text-xs text-amber-600 mt-1">Type at least 3 digits to search</p>
              )}
            </div>

            {/* Tier Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Tier</label>
              <Select 
                value={filters.tier === "" ? "all" : (filters.tier === null ? "empty" : filters.tier)} 
                onValueChange={(value) => {
                  if (value === "all") {
                    handleFilterChange("tier", "");
                  } else if (value === "empty") {
                    handleFilterChange("tier", "null");
                  } else {
                    handleFilterChange("tier", value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="Tier 1">Tier 1</SelectItem>
                  <SelectItem value="Tier 2">Tier 2</SelectItem>
                  <SelectItem value="Tier 3">Tier 3</SelectItem>
                  <SelectItem value="Tier 4">Tier 4</SelectItem>
                  <SelectItem value="empty">No Tier (Empty)</SelectItem>
                </SelectContent>
              </Select>
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
              <TableHead title={hasActiveFilters ? "Sequential numbering for filtered results" : "Sequential numbering for all results"}>
                Serial No.{hasActiveFilters ? " (Filtered)" : ""}
              </TableHead>
              <TableHead>State Code</TableHead>
              <TableHead>District Code</TableHead>
              <TableHead>SubDistrict Code</TableHead>
              <TableHead>Village Code</TableHead>
              <TableHead>Pincode</TableHead>
              <TableHead>State Name</TableHead>
              <TableHead>District Name</TableHead>
              <TableHead>SubDistrict Name</TableHead>
              <TableHead>Village Name</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row["S.No."]}>
                <TableCell title={hasActiveFilters ? "Serial number for filtered results" : "Serial number for all results"}>
                  {getSerialNumber(index)}
                </TableCell>
                <TableCell>{row["State Code"]}</TableCell>
                <TableCell>{row["District Code"]}</TableCell>
                <TableCell>{row["SubDistrict Code"]}</TableCell>
                <TableCell>{row["Village Code"]}</TableCell>
                <TableCell>{row["Pincode"]}</TableCell>
                <TableCell>{row["State Name"]}</TableCell>
                <TableCell>{row["District Name"]}</TableCell>
                <TableCell>{row["SubDistrict Name"]}</TableCell>
                <TableCell>{row["Village Name"]}</TableCell>
                <TableCell>
                  {editingRow === index ? (
                    <Select value={editValue} onValueChange={setEditValue}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select tier..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tier 1">Tier 1</SelectItem>
                        <SelectItem value="Tier 2">Tier 2</SelectItem>
                        <SelectItem value="Tier 3">Tier 3</SelectItem>
                        <SelectItem value="Tier 4">Tier 4</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    row["Tier"] || "-"
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === index ? (
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
                      onClick={() => handleEdit(index, row["Tier"])}
                      className="h-8 w-8 p-0"
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
      
      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          Loading data...
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
