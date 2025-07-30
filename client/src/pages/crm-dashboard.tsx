
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users, Building2, Target, DollarSign, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CRMDashboard() {
  const [selectedView, setSelectedView] = useState<"leads" | "properties" | "people" | "teams">("leads");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - replace with actual API calls
  const stats = {
    totalLeads: 45,
    activeProperties: 28,
    monthlyRevenue: 125000,
    conversionRate: 18
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM Imobiliário</h1>
            <p className="text-gray-600">Gerencie leads, propriedades e vendas</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">+12% desde o mês passado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Propriedades Ativas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProperties}</div>
              <p className="text-xs text-muted-foreground">+3 novas esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% desde o mês passado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">+2.1% desde o mês passado</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="properties">Propriedades</TabsTrigger>
            <TabsTrigger value="people">Contatos</TabsTrigger>
            <TabsTrigger value="teams">Equipes</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            <LeadsView />
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <PropertiesView />
          </TabsContent>

          <TabsContent value="people" className="space-y-6">
            <PeopleView />
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <TeamsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Leads Pipeline View
function LeadsView() {
  const stages = [
    { id: "new", name: "Novo", color: "bg-blue-500", count: 12 },
    { id: "contacted", name: "Contatado", color: "bg-yellow-500", count: 8 },
    { id: "qualified", name: "Qualificado", color: "bg-purple-500", count: 6 },
    { id: "visit_scheduled", name: "Visita Agendada", color: "bg-orange-500", count: 4 },
    { id: "proposal_sent", name: "Proposta Enviada", color: "bg-pink-500", count: 3 },
    { id: "negotiating", name: "Negociando", color: "bg-indigo-500", count: 2 },
    { id: "closed_won", name: "Fechado", color: "bg-green-500", count: 5 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pipeline de Vendas</h2>
        <div className="flex items-center gap-3">
          <Input placeholder="Buscar leads..." className="w-64" />
          <Select value="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="new">Novos</SelectItem>
              <SelectItem value="hot">Quentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {stages.map((stage) => (
          <Card key={stage.id} className="min-h-96">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <CardTitle className="text-sm">{stage.name}</CardTitle>
                </div>
                <Badge variant="secondary">{stage.count}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Mock lead cards */}
              {Array.from({ length: stage.count }).map((_, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <h4 className="font-medium text-sm mb-1">Lead Exemplo {i + 1}</h4>
                  <p className="text-xs text-gray-600 mb-2">João Silva</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-600">R$ 350.000</span>
                    <span className="text-xs text-gray-500">2 dias</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Properties View
function PropertiesView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Propriedades</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Propriedade
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <Building2 className="h-12 w-12 text-gray-400" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Apartamento Centro</h3>
                <Badge variant="outline">Disponível</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">3 quartos, 2 banheiros, 85m²</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-green-600">R$ 450.000</span>
                <span className="text-sm text-gray-500">São Paulo, SP</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// People/Contacts View
function PeopleView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Contatos</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contato
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">João Silva {i + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      joao{i + 1}@email.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      (11) 99999-{String(i).padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                        {i % 2 === 0 ? "Cliente" : "Lead"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-green-600">Ativo</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Teams View
function TeamsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Equipes</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Equipe
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Equipe {i + 1}</CardTitle>
                <Badge variant="outline">{3 + i} membros</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Leads ativos</span>
                  <span className="font-medium">{12 + i * 3}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Meta mensal</span>
                  <span className="font-medium">R$ {(50 + i * 10).toLocaleString()}k</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversão</span>
                  <span className="font-medium text-green-600">{15 + i * 2}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
