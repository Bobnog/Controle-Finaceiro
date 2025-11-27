import React, { useState, useEffect } from "react";
import axios from 'axios'; // Importa a biblioteca Axios para fazer requisições HTTP.
import { 
    TextField, Button, Select, MenuItem, FormControl, InputLabel, // Componentes de UI do Material-UI para campos de texto, botões, seleção e rótulos de controle.
    Dialog, DialogActions, DialogContent, DialogTitle, Box // Componentes de UI do Material-UI para caixas de diálogo.
} from '@mui/material';

/**
 * Componente TransacaoForm: Um formulário para adicionar ou editar transações financeiras.
 * É renderizado como um modal (Dialog) do Material-UI.
 * @param {object} props - As propriedades do componente.
 * @param {boolean} props.open - Controla a visibilidade do modal.
 * @param {function} props.onSave - Função de callback executada após salvar com sucesso.
 * @param {function} props.onCancel - Função de callback executada ao cancelar.
 * @param {object} props.initialData - Dados iniciais para preencher o formulário em modo de edição.
 */
export default function TransacaoForm({ open, onSave, onCancel, initialData }) {
    // Estados locais para os campos do formulário.
    const [tipo, setTipo] = useState("gasto"); // Tipo da transação: "gasto" ou "receita", padrão "gasto".
    const [valor, setValor] = useState(""); // Valor da transação.
    const [categoria, setCategoria] = useState(""); // Categoria da transação.
    const [descricao, setDescricao] = useState(""); // Descrição da transação.
    // Data da transação, padrão para a data atual no formato YYYY-MM-DD.
    const [data, setData] = useState(new Date().toISOString().slice(0, 10));
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
            setTipo(initialData.tipo);
            setValor(initialData.valor);
            setCategoria(initialData.categoria || ""); // Garante string vazia se categoria for null.
            setDescricao(initialData.descricao || ""); // Garante string vazia se descricao for null.
            // Converte a data para o formato YYYY-MM-DD para o input type="date".
            setData(new Date(initialData.data).toISOString().slice(0, 10));
        } else {
            // Reseta o formulário para valores padrão para criação de nova transação.
            setTipo("gasto");
            setValor("");
            setCategoria("");
            setDescricao("");
            setData(new Date().toISOString().slice(0, 10));
        }
    }, [initialData, isEditMode, open]); // Dependências: initialData, isEditMode e open (para resetar ao abrir).


    /**
     * Função para lidar com o envio do formulário.
     * Envia os dados para a API (criar ou atualizar transação).
     */
    async function handleSubmit(e) {
        e.preventDefault(); // Previne o comportamento padrão de recarregar a página.
        setError(""); // Limpa qualquer erro anterior.
        const token = localStorage.getItem("token"); // Obtém o token de autenticação do localStorage.
        // Cria o objeto de dados da transação, convertendo o valor para float.
        const transactionData = { tipo, valor: parseFloat(valor), categoria, descricao, data };

        try {
            if (isEditMode) {
                // Se em modo de edição, envia uma requisição PUT para atualizar a transação existente.
                await axios.put(`http://127.0.0.1:8000/transacoes/${initialData.id}`, transactionData, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                // Se em modo de criação, envia uma requisição POST para adicionar uma nova transação.
                await axios.post("http://127.0.0.1:8000/transacoes/", transactionData, { headers: { Authorization: `Bearer ${token}` } });
            }
            onSave(); // Chama a função onSave passada por props após o sucesso.
        } catch (err) {
            // Em caso de erro na requisição, exibe uma mensagem de erro.
            setError("Erro ao salvar transação. Verifique os dados.");
        }
    }

    return (
        // Componente Dialog do Material-UI para exibir o formulário como um modal.
        <Dialog open={open} onClose={onCancel}>
            {/* Título do modal, que muda dependendo do modo (edição ou adição). */}
            <DialogTitle>{isEditMode ? 'Editar Transação' : 'Adicionar Transação'}</DialogTitle>
            <DialogContent>
                {/* O formulário em si, dentro de um componente Box para organização de layout. */}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    {/* Campo de seleção para o Tipo da transação (Receita/Gasto). */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="tipo-label">Tipo</InputLabel>
                        <Select
                            labelId="tipo-label"
                            value={tipo}
                            label="Tipo"
                            onChange={e => setTipo(e.target.value)}
                        >
                            <MenuItem value="receita">Receita</MenuItem>
                            <MenuItem value="gasto">Gasto</MenuItem>
                        </Select>
                    </FormControl>
                    {/* Campo de texto para o Valor da transação. */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Valor"
                        type="number"
                        value={valor}
                        onChange={e => setValor(e.target.value)}
                    />
                    {/* Campo de texto para a Categoria da transação. */}
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Categoria"
                        value={categoria}
                        onChange={e => setCategoria(e.target.value)}
                    />
                    {/* Campo de texto para a Descrição da transação. */}
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Descrição"
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                    />
                    {/* Campo de seleção de Data da transação. */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        type="date"
                        label="Data"
                        value={data}
                        onChange={e => setData(e.target.value)}
                        InputLabelProps={{ shrink: true }} // Garante que o rótulo encolha corretamente.
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