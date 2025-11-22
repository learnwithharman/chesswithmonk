import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface OpeningIndexItem {
    name: string;
    eco: string;
    fen: string;
    moves: string;
}

type EcoIndex = Record<string, OpeningIndexItem[]>;

const AllOpenings = () => {
    const [index, setIndex] = useState<EcoIndex | null>(null);
    const [search, setSearch] = useState('');
    const [selectedEco, setSelectedEco] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/data/eco_index.json')
            .then(res => res.json())
            .then(setIndex)
            .catch(console.error);
    }, []);

    if (!index) return <div className="p-8 text-center">Loading openings...</div>;

    const filteredEcos = Object.keys(index).filter(eco => {
        if (!search) return true;
        const variations = index[eco];
        return eco.toLowerCase().includes(search.toLowerCase()) ||
            variations.some(v => v.name.toLowerCase().includes(search.toLowerCase()));
    }).sort();

    // Group ECOs by Opening Name
    const groupedEcos = filteredEcos.reduce((acc, eco) => {
        const firstItem = index[eco][0];
        const fullName = firstItem?.name || "Unknown Opening";
        const familyName = fullName.split(':')[0].trim();

        if (!acc[familyName]) acc[familyName] = [];
        acc[familyName].push(eco);
        return acc;
    }, {} as Record<string, string[]>);

    // Split into White and Black openings
    const whiteOpenings: string[] = [];
    const blackOpenings: string[] = [];

    Object.keys(groupedEcos).sort().forEach(family => {
        // Heuristic: Defense, Counter, Benoni -> Black
        if (family.includes('Defense') || family.includes('Counter') || family.includes('Benoni')) {
            blackOpenings.push(family);
        } else {
            whiteOpenings.push(family);
        }
    });

    const hierarchy = selectedEco && index ? index[selectedEco].reduce((acc, item) => {
        const parts = item.name.split(':');
        const family = parts[0].trim();
        const rest = parts[1] ? parts[1].trim() : '';

        let system = 'Main Line';

        if (rest) {
            const subParts = rest.split(',');
            system = subParts[0].trim();
        }

        if (!acc[family]) acc[family] = {};
        if (!acc[family][system]) acc[family][system] = [];

        acc[family][system].push(item);
        return acc;
    }, {} as Record<string, Record<string, OpeningIndexItem[]>>) : {};

    const renderFamilyGroup = (families: string[]) => (
        <Accordion type="multiple" className="w-full">
            {families.map(family => (
                <AccordionItem value={family} key={family} className="border-b-0">
                    <AccordionTrigger className="py-2 px-2 hover:bg-accent hover:no-underline rounded-md text-sm font-semibold">
                        <div className="flex items-center justify-between w-full pr-2">
                            <span>{family}</span>
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                {groupedEcos[family].length}
                            </Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2 pt-1">
                        <div className="pl-4 space-y-0.5 border-l-2 border-muted ml-2">
                            {groupedEcos[family].map(eco => (
                                <Button
                                    key={eco}
                                    variant={selectedEco === eco ? "secondary" : "ghost"}
                                    className="w-full justify-start font-mono h-8 text-xs"
                                    onClick={() => setSelectedEco(eco)}
                                >
                                    <span className="font-bold mr-2 text-primary">{eco}</span>
                                    <span className="truncate text-muted-foreground">
                                        {index[eco][0]?.name.split(':')[1]?.trim() || "Main Line"}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search openings..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_300px] gap-6 flex-1 min-h-0">
                {/* Left Sidebar: White Openings */}
                <Card className="flex flex-col h-full order-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">White Openings</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-full">
                            <div className="p-2 space-y-4">
                                <div>
                                    {renderFamilyGroup(whiteOpenings)}
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Middle: Variations List */}
                <Card className="flex flex-col h-full order-2">
                    <CardHeader>
                        <CardTitle>
                            {selectedEco ? (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-primary font-mono text-xl">{selectedEco}</span>
                                    <span>Variations</span>
                                </div>
                            ) : 'Select an ECO Code'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-full p-6">
                            {selectedEco ? (
                                <div className="space-y-8">
                                    {Object.entries(hierarchy).map(([family, systems]) => (
                                        <div key={family} className="space-y-4">
                                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 border-b pb-2">
                                                {family}
                                            </h3>

                                            <Accordion type="multiple" className="w-full">
                                                {Object.entries(systems).map(([system, variations]) => (
                                                    <AccordionItem value={system} key={system} className="border rounded-lg px-4 mb-2 bg-card/50">
                                                        <AccordionTrigger className="hover:no-underline py-3">
                                                            <div className="flex items-center gap-3 text-left">
                                                                <span className="font-semibold text-sm">{system}</span>
                                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                                                    {variations.length} lines
                                                                </Badge>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pt-2 pb-4">
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {variations.map((variation, i) => {
                                                                    let displayName = variation.name;
                                                                    if (displayName.includes(':')) {
                                                                        const rest = displayName.split(':')[1];
                                                                        if (rest.includes(',')) {
                                                                            displayName = rest.split(',').slice(1).join(',').trim();
                                                                        } else {
                                                                            if (system === 'Main Line') {
                                                                                displayName = rest.trim();
                                                                            } else {
                                                                                displayName = "Main Line";
                                                                            }
                                                                        }
                                                                    } else {
                                                                        displayName = "Main Line";
                                                                    }

                                                                    if (!displayName) displayName = "Main Line";

                                                                    return (
                                                                        <div
                                                                            key={i}
                                                                            className="group flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                                                            onClick={() => navigate(`/learn-openings?eco=${variation.eco}&name=${encodeURIComponent(variation.name)}`)}
                                                                        >
                                                                            <div className="flex flex-col gap-1">
                                                                                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                                                                    {displayName}
                                                                                </span>
                                                                                <span className="text-xs font-mono text-muted-foreground">
                                                                                    {variation.moves}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <Button size="sm" variant="ghost" className="h-7 text-xs">Learn</Button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <BookOpen className="w-16 h-16 opacity-20 mb-4" />
                                    <p>Select an opening code to view variations</p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Right Sidebar: Black Openings */}
                <Card className="flex flex-col h-full order-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Black Openings</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-full">
                            <div className="p-2 space-y-4">
                                <div>
                                    {renderFamilyGroup(blackOpenings)}
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AllOpenings;
