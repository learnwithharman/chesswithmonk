import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllOpenings from "@/components/openings/AllOpenings";
import FamousOpenings from "@/components/openings/FamousOpenings";

const Openings = () => {
    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
            <Tabs defaultValue="all" className="flex-1 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <TabsList>
                        <TabsTrigger value="all">All Openings</TabsTrigger>
                        <TabsTrigger value="famous">Famous Openings</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="flex-1 min-h-0 mt-0 h-full">
                    <AllOpenings />
                </TabsContent>

                <TabsContent value="famous" className="flex-1 min-h-0 mt-0 h-full overflow-auto">
                    <FamousOpenings />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Openings;
