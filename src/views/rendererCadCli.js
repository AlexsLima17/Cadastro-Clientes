function buscarEndereco() {
    let cep = document.getElementById('cep').value.replace(/\D/g, '');

    if (cep.length !== 8) {
        return;
    }

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(dados => {
            if (dados.erro) {
                return;
            }

            document.getElementById('complemento').value = dados.logradouro || '';
            document.getElementById('cidade').value = dados.localidade || '';
            document.getElementById('estado').value = dados.uf || '';
        })
        .catch(error => console.error('Erro ao buscar o endereço:', error));
}

function validarCPF() {
    let cpf = document.getElementById('cpf').value.replace(/\D/g, '').trim();
    document.getElementById('cpfErro').style.display = isValidCPF(cpf) ? 'none' : 'block';
}

function isValidCPF(cpf) {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
}

async function adicionarCliente() {
    const cliente = obterDadosFormulario();
    if (!cliente) {
        return;
    }

    const resposta = await window.electron.invoke("cliente:adicionar", cliente);

    if (resposta.sucesso) {
        resetForm();
    } else {
    }
}


async function excluirCliente() {
    const clienteId = prompt("Informe o ID do cliente que deseja excluir:");
    if (!clienteId) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/clientes/${clienteId}`, { method: 'DELETE' });
        const data = await response.json();
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
    }

    resetForm();
}

async function editarCliente() {
    const clienteId = prompt("Informe o ID do cliente que deseja editar:");
    if (!clienteId) {
        return;
    }

    const cliente = obterDadosFormulario();
    if (!cliente) return;

    try {
        const response = await fetch(`http://localhost:3000/api/clientes/${clienteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });

        const data = await response.json();
    } catch (error) {
        console.error('Erro ao editar cliente:', error);
    }

    resetForm();
}

function obterDadosFormulario() {
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '').trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cep = document.getElementById('cep').value.trim();
    const numero = document.getElementById('numero').value.trim();
    const estado = document.getElementById('estado').value.trim();
    const cidade = document.getElementById('cidade').value.trim();

    if (!nome || !cpf || !telefone || !cep) {
        return null;
    }

    return { nome, cpf, telefone, cep, endereco, numero, estado, cidade };
}

function resetForm() {
    document.getElementById('nome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('cep').value = '';
    document.getElementById('endereco').value = '';
    document.getElementById('numero').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('cidade').value = '';
}

// Adicionando event listeners apenas se os elementos existirem
document.querySelector('.btn-success')?.addEventListener('click', adicionarCliente);
document.querySelector('.btn-danger')?.addEventListener('click', excluirCliente);
document.querySelector('.btn-warning')?.addEventListener('click', editarCliente);
