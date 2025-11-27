import React, { useState, useEffect } from "react";
import axios from 'axios'; // Importa a biblioteca Axios para fazer requisições HTTP.
import { 
    TextField, Button, Switch, FormControlLabel, // Componentes de UI do Material-UI para campos de texto, botões, switch e rótulos de controle.
    Dialog, DialogActions, DialogContent, DialogTitle, Box // Componentes de UI do Material-UI para caixas de diálogo.
} from '@mui/material';

/**
 * Componente CartaoForm: Um formulário para adicionar ou editar faturas/dívidas de cartão.
 * É renderizado como um modal (Dialog) do Material-UI.
 * @param {object} props - As propriedades do componente.
 * @param {boolean} props.open - Controla a visibilidade do modal.
 * @param {function} props.onSave - Função de callback executada após salvar com sucesso.
 * @param {function} props.onCancel - Função de callback executada ao cancelar.
 * @param {object} props.initialData - Dados iniciais para preencher o formulário em modo de edição.
 */
export default function CartaoForm({ open, onSave, onCancel, initialData }) {
    // Estados locais para os campos do formulário.
    const [instituicao, setInstituicao] = useState("");
    const [valor, setValor] = useState("");
    const [mes, setMes] = useState(new Date().getMonth() + 1); // Mês atual por padrão.
    const [ano, setAno] = useState(new Date().getFullYear()); // Ano atual por padrão.
    const [pago, setPago] = useState(false); // Status de pagamento, padrão como falso.
    const [error, setError] = useState(""); // Estado para mensagens de erro.

    // Determina se o formulário está no modo de edição (se initialData e initialData.id existem).
    const isEditMode = initialData && initialData.id;

    /**
     * Efeito que preenche o formulário com `initialData` quando em modo de edição,
     * ou reseta o formulário quando em modo de criação ou quando o modal é reaberto.
     */
    useEffect(() => {
        if (isEditMode) {
            // Preenche os campos com os dados iniciais para edição.
            setInstituicao(initialData.instituicao);
            setValor(initialData.valor);
            setMes(initialData.mes);
            setAno(initialData.ano);
            setPago(initialData.pago);
        } else {
            // Reseta o formulário para valores padrão para criação de nova fatura.
            setInstituicao("");
            setValor("");
            setMes(new Date().getMonth() + 1);
            setAno(new Date().getFullYear());
            setPago(false);
        }
    }, [initialData, isEditMode, open]); // Dependências: initialData, isEditMode e open (para resetar ao abrir).

    /**
     * Função para lidar com o envio do formulário.
     * Envia os dados para a API (criar ou atualizar fatura).
     */
    async function handleSubmit(e) {
        e.preventDefault(); // Previne o comportamento padrão de recarregar a página.
        setError(""); // Limpa qualquer erro anterior.
        const token = localStorage.getItem("token"); // Obtém o token de autenticação do localStorage.
        // Cria o objeto de dados da fatura, convertendo valor, mês e ano para os tipos corretos.
        const cartaoData = { instituicao, valor: parseFloat(valor), mes: parseInt(mes), ano: parseInt(ano), pago };

        try {
            if (isEditMode) {
                // Se em modo de edição, envia uma requisição PUT para atualizar a fatura existente.
                await axios.put(`http://127.0.0.1:8000/cartoes/${initialData.id}`, cartaoData, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                // Se em modo de criação, envia uma requisição POST para adicionar uma nova fatura.
                await axios.post("http://127.0.0.1:8000/cartoes/", cartaoData, { headers: { Authorization: `Bearer ${token}` } });
            }
            onSave(); // Chama a função onSave passada por props após o sucesso.
        } catch (err) {
            // Em caso de erro na requisição, exibe uma mensagem de erro.
            setError("Erro ao salvar fatura. Verifique os dados.");
        }
    }

    return (
        // Componente Dialog do Material-UI para exibir o formulário como um modal.
        <Dialog open={open} onClose={onCancel}>
            {/* Título do modal, que muda dependendo do modo (edição ou adição). */}
            <DialogTitle>{isEditMode ? 'Editar Fatura/Dívida' : 'Adicionar Fatura/Dívida'}</DialogTitle>
            <DialogContent>
                {/* O formulário em si, dentro de um componente Box para organização de layout. */}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    {/* Campos de texto para Instituição, Valor, Mês e Ano. */}
                    <TextField
                        margin="normal" required fullWidth label="Instituição"
                        value={instituicao} onChange={e => setInstituicao(e.target.value)}
                    />
                    <TextField
                        margin="normal" required fullWidth label="Valor" type="number"
                        value={valor} onChange={e => setValor(e.target.value)}
                    />
                    <TextField
                        margin="normal" required fullWidth label="Mês" type="number"
                        inputProps={{ min: 1, max: 12 }} // Limita o input do mês entre 1 e 12
                        value={mes} onChange={e => setMes(e.target.value)}
                    />
                    <TextField
                        margin="normal" required fullWidth label="Ano" type="number"
                        inputProps={{ min: 2000, max: 2100 }} // Limita o input do ano para um período razoável
                        value={ano} onChange={e => setAno(e.target.value)}
                    />
                    {/* Switch para indicar se a fatura está paga ou não. */}
                    <FormControlLabel
                        control={<Switch checked={pago} onChange={e => setPago(e.target.checked)} />}
                        label="Pago"
                    />
                    {/* Exibe mensagem de erro, se houver. */}
                    {error && <Typography color="error">{error}</Typography>}
                </Box>
            </DialogContent>
            <DialogActions>
                {/* Botões de Ação para Cancelar e Salvar. */}
                <Button onClick={onCancel}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
}