import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Plus, CheckCircle2, PauseCircle, Calendar, Edit2, RefreshCcw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Layout, PageHeader } from '../components/layout';

interface CampaignForm {
  id?: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface CampaignRow extends CampaignForm {
  created_at?: string;
  updated_at?: string;
}

const statusBadge = (isActive: boolean) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
    }`}
  >
    {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />}
    {isActive ? 'Ativa' : 'Pausada'}
  </span>
);

const emptyForm: CampaignForm = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  is_active: true,
};

const Campaigns: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState<CampaignForm>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['nps-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nps_campaigns')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as CampaignRow[];
    },
  });

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (form.id) {
        const { error } = await supabase
          .from('nps_campaigns')
          .update({
            name: form.name,
            description: form.description || null,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
            is_active: form.is_active,
          })
          .eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('nps_campaigns').insert({
          name: form.name,
          description: form.description || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          is_active: form.is_active,
        });
        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['nps-campaigns'] });
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar campanha:', err);
      alert('Erro ao salvar campanha.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (campaign: CampaignRow) => {
    setForm({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description || '',
      start_date: campaign.start_date || '',
      end_date: campaign.end_date || '',
      is_active: campaign.is_active,
    });
  };

  const handleToggleActive = async (campaign: CampaignRow) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('nps_campaigns')
        .update({ is_active: !campaign.is_active })
        .eq('id', campaign.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['nps-campaigns'] });
    } catch (err) {
      console.error('Erro ao alternar status:', err);
      alert('Erro ao alternar status da campanha.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (campaign: CampaignRow) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('nps_campaigns').insert({
        name: `${campaign.name} (cópia)`,
        description: campaign.description || null,
        start_date: campaign.start_date || null,
        end_date: campaign.end_date || null,
        is_active: false,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['nps-campaigns'] });
    } catch (err) {
      console.error('Erro ao duplicar campanha:', err);
      alert('Erro ao duplicar campanha.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Campanhas NPS"
        description="Crie ciclos (ex: NPS Janeiro, Março) e controle a exibição do widget."
        breadcrumbs={[{ name: 'Campanhas' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Lista de campanhas</h2>
                  <p className="text-sm text-gray-500">Ative/desative e edite rapidamente.</p>
                </div>
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-md border border-gray-200"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Limpar formulário
                </button>
              </div>

              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando campanhas...
                </div>
              )}
              {error && <p className="text-sm text-red-600">Erro ao carregar campanhas.</p>}

              <div className="space-y-3 mt-4">
                {campaigns?.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-lg px-4 py-3 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">{c.name}</h3>
                        {statusBadge(c.is_active)}
                      </div>
                      {c.description && <p className="text-sm text-gray-600">{c.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />
                          {c.start_date ? format(new Date(c.start_date), 'dd/MM/yyyy') : 'Sem início'}
                        </span>
                        <span>→</span>
                        <span className="inline-flex items-center gap-1">
                          {c.end_date ? format(new Date(c.end_date), 'dd/MM/yyyy') : 'Sem fim'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                          c.is_active
                            ? 'text-gray-700 border-gray-200 hover:bg-gray-50'
                            : 'text-green-700 border-green-200 hover:bg-green-50'
                        }`}
                        disabled={submitting}
                      >
                        {c.is_active ? <PauseCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {c.is_active ? 'Pausar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleEdit(c)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-700 border border-primary-200 rounded-md hover:bg-primary-50"
                      >
                        <Edit2 className="h-4 w-4" /> Editar
                      </button>
                      <button
                        onClick={() => handleDuplicate(c)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50"
                        disabled={submitting}
                      >
                        <Plus className="h-4 w-4" /> Duplicar
                      </button>
                    </div>
                  </div>
                ))}

                {campaigns && campaigns.length === 0 && (
                  <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-6 text-center">
                    Nenhuma campanha criada ainda. Crie a primeira ao lado.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{form.id ? 'Editar campanha' : 'Nova campanha'}</h2>
                <p className="text-sm text-gray-500">Defina período, status e descrição.</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: NPS Janeiro 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={2}
                  placeholder="Contexto da pesquisa"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">Exibir widget</p>
                  <p className="text-xs text-gray-500">Quando pausada, o widget não abre para a campanha.</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <div className={`w-11 h-6 flex items-center rounded-full p-1 transition ${form.is_active ? 'bg-primary' : 'bg-gray-300'}`}>
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                        form.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {form.id ? 'Salvar alterações' : 'Criar campanha'}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
    </Layout>
  );
};

export default Campaigns;
