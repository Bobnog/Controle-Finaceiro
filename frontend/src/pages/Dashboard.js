import React, { useEffect, useState, useCallback } from "react";
import axios from 'axios'; // Importa a biblioteca Axios para fazer requisições HTTP.
import { 
    AppBar, Toolbar, Typography, Button, Container, Grid, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    IconButton, Box, TextField, SpeedDial, SpeedDialIcon, SpeedDialAction 
} from '@mui/material'; // Componentes de UI do Material-UI.
import { 
    Edit as EditIcon, Delete as DeleteIcon, // Ícones de edição e exclusão.
    Receipt as ReceiptIcon, CreditCard as CreditCardIcon // Ícones para transação e cartão.
} from '@mui/icons-material'; // Ícones do Material-UI.
import { createTheme, ThemeProvider } from '@mui/material/styles'; // Para aplicar temas do Material-UI.
import TransacaoForm from './TransacaoForm'; // Componente de formulário para transações.
import CartaoForm from './CartaoForm'; // Componente de formulário para faturas/dívidas.

// Tema padrão do Material-UI.
const defaultTheme = createTheme();
// Função auxiliar para formatar valores monetários para exibição.
const formatCurrency = (value) => `R$ ${typeof value === 'number' ? value.toFixed(2).replace('.', ',') : '0,00'}`;

/**
 * Componente StatCard: Exibe um cartão com um título e um valor formatado.
 * Usado para mostrar os principais indicadores financeiros no dashboard.
 * @param {object} props - As propriedades do componente.
 * @param {string} props.title - O título do cartão (ex: "Total de Receitas").
 * @param {number} props.value - O valor a ser exibido no cartão.
 * @param {string} [props.color] - A cor do valor.
 */
const StatCard = ({ title, value, color }) => (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>{title}</Typography>
        <Typography component="p" variant="h4" sx={{ color: color }}>{formatCurrency(value)}</Typography>
    </Paper>
);

/**
 * Componente Dashboard: Exibe o painel de controle financeiro do usuário.
 * Carrega e exibe dados financeiros, permite adicionar/editar/deletar transações e faturas.
 * @param {object} props - As propriedades do componente.
 * @param {function} props.onLogout - Função de callback para realizar o logout.
 */
export default function Dashboard({ onLogout }) {
    // Estados para armazenar dados do dashboard e do usuário, status de carregamento e erros.
    const [dashboardData, setDashboardData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // Estado para o mês e ano atualmente selecionados, padrão para o mês/ano atual.
    const [date, setDate] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    // Estado para o salário base do usuário.
    const [salario, setSalario] = useState(0);
    
    // Estados para controle dos modais de formulário (transação/dívida).
    const [modalState, setModalState] = useState({ type: null, open: false, mode: 'create' });
    // Estado para armazenar o item atualmente sendo editado no modal.
    const [currentItem, setCurrentItem] = useState(null);

    /**
     * Função `fetchData`: Busca os dados do dashboard e do usuário na API.
     * Utiliza `useCallback` para memorizar a função e evitar recriações desnecessárias.
     */
    const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token"); // Obtém o token de autenticação.
    const headers = { Authorization: `Bearer ${token}` }; // Define os cabeçalhos de autorização.
    try {
        // Realiza requisições paralelas para dados do dashboard e dados do usuário.
        const [dashRes, userRes] = await Promise.all([
            axios.get(`http://127.0.0.1:8000/dashboard/?mes=${date.month}&ano=${date.year}`, { headers }),
            axios.get("http://127.0.0.1:8000/users/me", { headers })
        ]);
        // Atualiza os estados com os dados recebidos.
        setDashboardData(dashRes.data);
        setUserData(userRes.data);
        // Define o salário apenas no carregamento inicial para evitar sobrescrever edições do usuário.
        if(loading) setSalario(userRes.data.salario); 
    } catch (err) {
        setError("Erro ao carregar os dados."); // Define mensagem de erro.
        // Se o erro for 401 (Não Autorizado), realiza o logout.
        if (err.response && err.response.status === 401) onLogout();
    } finally {
        // Finaliza o estado de carregamento após a requisição.
        if(loading) setLoading(false);
    }
}, [date, onLogout, loading]); // Dependências da função: date, onLogout, loading.

    /**
     * useEffect: Executa `fetchData` quando a função `fetchData` é alterada (devido a dependências)
     * ou na montagem inicial do componente.
     */
    useEffect(() => { fetchData() }, [fetchData]);

    /**
     * Abre o modal de formulário para transações ou dívidas.
     * @param {string} type - Tipo do formulário a ser aberto ('transaction' ou 'debt').
     * @param {string} [mode='create'] - Modo do formulário ('create' ou 'edit').
     * @param {object} [item=null] - Item a ser editado (se em modo de edição).
     */
    const handleModalOpen = (type, mode = 'create', item = null) => {
        setModalState({ type, open: true, mode });
        setCurrentItem(item);
    };

    /**
     * Fecha o modal de formulário e reseta o item atual.
     */
    const handleModalClose = () => {
        setModalState({ type: null, open: false, mode: 'create' });
        setCurrentItem(null);
    };

    /**
     * Função chamada após salvar um item no formulário.
     * Fecha o modal e recarrega os dados do dashboard.
     */
    const handleSave = () => {
        handleModalClose();
        fetchData();
    };
    
    /**
     * Função para deletar uma transação ou fatura.
     * @param {string} type - Tipo do item a ser deletado ('transacoes' ou 'cartoes').
     * @param {number} id - ID do item a ser deletado.
     */
    const handleDelete = async (type, id) => {
        // Confirma com o usuário antes de deletar.
        if (!window.confirm("Tem certeza que deseja deletar este item?")) return;
        const token = localStorage.getItem("token");
        try {
            // Envia requisição DELETE para a API.
            await axios.delete(`http://127.0.0.1:8000/${type}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData(); // Recarrega os dados após a exclusão.
        } catch (err) {
            setError(`Erro ao deletar item.`); // Define mensagem de erro.
        }
    };

    /**
     * Salva o salário base do usuário na API.
     */
    const saveSalario = async () => {
        const token = localStorage.getItem("token");
        try {
            // Envia requisição PUT para atualizar o salário do usuário.
            await axios.put("http://127.0.0.1:8000/users/me", { salario }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData(); // Recarrega os dados para refletir a mudança no dashboard.
        } catch (err) { setError("Erro ao salvar salário."); } // Define mensagem de erro.
    };
    
    // Exibe um indicador de carregamento enquanto os dados estão sendo buscados.
    if (loading) return <div>Carregando...</div>;
    // Exibe uma mensagem de erro se ocorrer um problema no carregamento dos dados.
    if (error) return <div>{error}</div>;

    // Ações para o SpeedDial (botão flutuante de ações rápidas).
    const speedDialActions = [
        { icon: <ReceiptIcon />, name: 'Adicionar Transação', action: () => handleModalOpen('transaction') },
        { icon: <CreditCardIcon />, name: 'Adicionar Dívida', action: () => handleModalOpen('debt') },
    ];

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex' }}>
                {/* AppBar (barra superior) do dashboard. */}
                <AppBar position="absolute">
                    <Toolbar>
                        <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>Painel Financeiro</Typography>
                        {/* Botão de Sair, que aciona a função de logout. */}
                        <Button color="inherit" onClick={onLogout}>Sair</Button>
                    </Toolbar>
                </AppBar>

                {/* Conteúdo principal do dashboard. */}
                <Box component="main" sx={{ backgroundColor: (theme) => theme.palette.grey[100], flexGrow: 1, height: '100vh', overflow: 'auto', mt: '64px' }}>
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        {/* Seção para salário base e filtros de mês/ano. */}
                        <Paper sx={{ p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                            <TextField label="Salário Base" type="number" value={salario} onChange={e => setSalario(e.target.value)} size="small" />
                            <Button variant="contained" onClick={saveSalario} size="small">Salvar Salário</Button>
                            <TextField label="Mês" type="number" inputProps={{ min: 1, max: 12 }} value={date.month} onChange={e => setDate({ ...date, month: e.target.value })} size="small" sx={{ ml: 'auto' }}/>
                            <TextField label="Ano" type="number" inputProps={{ min: 2000, max: 2100 }} value={date.year} onChange={e => setDate({ ...date, year: e.target.value })} size="small" />
                        </Paper>

                        {/* Grid de StatCards para exibir resumos financeiros. */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}><StatCard title="Total de Receitas (mês)" value={dashboardData?.total_receitas} /></Grid>
                            <Grid item xs={12} md={3}><StatCard title="Total de Gastos (mês)" value={dashboardData?.total_gastos} /></Grid>
                            <Grid item xs={12} md={3}><StatCard title="Saldo do Mês" value={dashboardData?.saldo_atual} /></Grid>
                            <Grid item xs={12} md={3}><StatCard title="Balanço de Dívidas (mês)" value={dashboardData?.placar_dividas} color={dashboardData?.placar_dividas < 0 ? 'error.main' : 'success.main'} /></Grid>
                        </Grid>

                        {/* Grid para tabelas de Transações e Faturas/Dívidas. */}
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                    <Typography component="h2" variant="h6" color="primary" gutterBottom>Transações no Mês</Typography>
                                    <TableContainer><Table size="small">
                                        <TableHead><TableRow><TableCell>Data</TableCell><TableCell>Descrição</TableCell><TableCell align="right">Valor</TableCell><TableCell>Ações</TableCell></TableRow></TableHead>
                                        <TableBody>{userData?.transacoes?.filter(t => new Date(t.data).getUTCMonth() + 1 === parseInt(date.month) && new Date(t.data).getUTCFullYear() === parseInt(date.year)).map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell>{new Date(t.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                                                <TableCell>{t.descricao}</TableCell>
                                                <TableCell align="right" sx={{ color: t.tipo === 'gasto' ? 'error.main' : 'success.main' }}>{formatCurrency(t.valor)}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleModalOpen('transaction', 'edit', t)}><EditIcon/></IconButton>
                                                    <IconButton onClick={() => handleDelete('transacoes', t.id)}><DeleteIcon/></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}</TableBody>
                                    </Table></TableContainer>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                    <Typography component="h2" variant="h6" color="primary" gutterBottom>Faturas e Dívidas no Mês</Typography>
                                    <TableContainer><Table size="small">
                                        <TableHead><TableRow><TableCell>Instituição</TableCell><TableCell>Status</TableCell><TableCell align="right">Valor</TableCell><TableCell>Ações</TableCell></TableRow></TableHead>
                                        <TableBody>{userData?.cartoes?.filter(c => c.mes === parseInt(date.month) && c.ano === parseInt(date.year)).map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell>{c.instituicao}</TableCell>
                                                <TableCell>{c.pago ? 'Pago' : 'Pendente'}</TableCell>
                                                <TableCell align="right">{formatCurrency(c.valor)}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleModalOpen('debt', 'edit', c)}><EditIcon/></IconButton>
                                                    <IconButton onClick={() => handleDelete('cartoes', c.id)}><DeleteIcon/></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}</TableBody>
                                    </Table></TableContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
                
                {/* Modais de formulário para Transações e Faturas/Dívidas. */}
                {modalState.type === 'transaction' && (
                    <TransacaoForm 
                        open={modalState.open} 
                        onSave={handleSave} 
                        onCancel={handleModalClose} 
                        initialData={modalState.mode === 'edit' ? currentItem : null} 
                    />
                )}
                {modalState.type === 'debt' && (
                    <CartaoForm 
                        open={modalState.open} 
                        onSave={handleSave} 
                        onCancel={handleModalClose} 
                        initialData={modalState.mode === 'edit' ? currentItem : null} 
                    />
                )}

                {/* SpeedDial (botão flutuante de ações rápidas) para adicionar novas transações ou dívidas. */}
                <SpeedDial ariaLabel="Adicionar" sx={{ position: 'absolute', bottom: 16, right: 16 }} icon={<SpeedDialIcon />}>
                    {speedDialActions.map((action) => (
                        <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={action.action} />
                    ))}
                </SpeedDial>
            </Box>
        </ThemeProvider>
    );
}