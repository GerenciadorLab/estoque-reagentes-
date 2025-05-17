document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos
    const reagenteForm = document.getElementById('reagenteForm');
    const reagentesTable = document.getElementById('reagentesTable');
    const qrCodeImage = document.getElementById('qrCodeImage');
    const reagenteModal = new bootstrap.Modal(document.getElementById('reagenteModal'));
    const qrModal = new bootstrap.Modal(document.getElementById('qrModal'));
    
    // Carrega os reagentes quando a página é carregada
    carregarReagentes();
    
    // Adiciona um novo reagente com suporte a decimais
    reagenteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const volume = parseFloat(document.getElementById('volume').value);
        const vencimento = document.getElementById('vencimento').value;
        const reducao = parseFloat(document.getElementById('reducao').value);
        
        // Validação para números decimais
        if (isNaN(volume) || isNaN(reducao)) {
            alert("Por favor, insira valores numéricos válidos!");
            return;
        }

        // Garante 3 casas decimais
        const volumeFormatado = parseFloat(volume.toFixed(3));
        const reducaoFormatada = parseFloat(reducao.toFixed(3));
        
        // Adiciona ao Firebase
        db.collection('reagentes').add({
            nome: nome,
            volume: volumeFormatado,
            volumeInicial: volumeFormatado,
            vencimento: vencimento,
            reducao: reducaoFormatada,
            dataCadastro: new Date().toISOString()
        })
        .then(() => {
            alert('Reagente adicionado com sucesso!');
            reagenteForm.reset();
            carregarReagentes();
        })
        .catch(error => {
            console.error('Erro ao adicionar reagente: ', error);
            alert('Erro ao adicionar reagente. Por favor, tente novamente.');
        });
    });
    
    // Carrega todos os reagentes do Firebase
    function carregarReagentes() {
        reagentesTable.innerHTML = '';
        
        db.collection('reagentes').orderBy('dataCadastro', 'desc').get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const reagente = doc.data();
                const id = doc.id;
                
                // Formata a data de vencimento
                const dataVencimento = new Date(reagente.vencimento);
                const dataFormatada = dataVencimento.toLocaleDateString('pt-BR');
                
                // Verifica se está vencido
                const hoje = new Date();
                const vencido = dataVencimento < hoje;
                
                // Cria a linha da tabela
                const row = document.createElement('tr');
                if (vencido) {
                    row.classList.add('table-danger');
                }
                
                row.innerHTML = `
                    <td>${reagente.nome}</td>
                    <td>${reagente.volume.toFixed(3)} / ${reagente.volumeInicial.toFixed(3)} ml</td>
                    <td>${dataFormatada} ${vencido ? '(Vencido)' : ''}</td>
                    <td>
                        <button class="btn btn-sm btn-info qr-btn" data-id="${id}">Ver QR Code</button>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-btn" data-id="${id}">Editar</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${id}">Excluir</button>
                    </td>
                `;
                
                reagentesTable.appendChild(row);
            });
            
            // Adiciona eventos aos botões
            adicionarEventosBotoes();
        })
        .catch(error => {
            console.error('Erro ao carregar reagentes: ', error);
        });
    }
    
    // Adiciona eventos aos botões dinamicamente criados
    function adicionarEventosBotoes() {
        // Botões QR Code
        document.querySelectorAll('.qr-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                gerarQRCode(id);
                qrModal.show();
            });
        });
        
        // Botões Editar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editarReagente(id);
            });
        });
        
        // Botões Excluir
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Tem certeza que deseja excluir este reagente?')) {
                    excluirReagente(id);
                }
            });
        });
    }
    
    // Gera QR Code para um reagente
    function gerarQRCode(id) {
        // Limpa o conteúdo anterior
        qrCodeImage.innerHTML = '';
        document.getElementById('qrReagenteNome').textContent = '';
        document.getElementById('qrVolumeAtual').textContent = '';
        document.getElementById('qrReducao').textContent = '';
        document.getElementById('qrVencimento').textContent = '';
        
        // Busca os dados do reagente
        db.collection('reagentes').doc(id).get()
        .then(doc => {
            if (doc.exists) {
                const reagente = doc.data();
                
                // Preenche as informações do reagente
                document.getElementById('qrReagenteNome').textContent = reagente.nome;
                document.getElementById('qrVolumeAtual').textContent = reagente.volume.toFixed(3);
                document.getElementById('qrReducao').textContent = reagente.reducao.toFixed(3);
                
                // Formata a data de vencimento
                const dataVencimento = new Date(reagente.vencimento);
                document.getElementById('qrVencimento').textContent = dataVencimento.toLocaleDateString('pt-BR');
                
                // URL que será aberta ao escanear o QR Code
                const url = `${window.location.origin}${window.location.pathname}?use=${id}`;
                
                // Cria o QR Code
                const qr = qrcode(0, 'L');
                qr.addData(url);
                qr.make();
                
                // Adiciona a imagem ao modal
                qrCodeImage.innerHTML = qr.createImgTag(6);
                
                // Estiliza a imagem do QR Code
                const qrImg = qrCodeImage.querySelector('img');
                qrImg.style.width = '100%';
                qrImg.style.maxWidth = '300px';
                qrImg.style.height = 'auto';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar reagente:', error);
            qrCodeImage.innerHTML = '<div class="alert alert-danger">Erro ao carregar dados do reagente</div>';
        });
    }
    
    // Edita um reagente com suporte a decimais
    function editarReagente(id) {
        db.collection('reagentes').doc(id).get()
        .then(doc => {
            if (doc.exists) {
                const reagente = doc.data();
                const modalBody = document.getElementById('modalBody');
                
                modalBody.innerHTML = `
                    <form id="editForm">
                        <div class="mb-3">
                            <label for="editNome" class="form-label">Nome do Reagente</label>
                            <input type="text" class="form-control" id="editNome" value="${reagente.nome}" required>
                        </div>
                        <div class="mb-3">
                            <label for="editVolume" class="form-label">Volume Total (ml)</label>
                            <input type="number" step="0.001" class="form-control" id="editVolume" value="${reagente.volumeInicial}" required>
                        </div>
                        <div class="mb-3">
                            <label for="editVencimento" class="form-label">Data de Vencimento</label>
                            <input type="date" class="form-control" id="editVencimento" value="${reagente.vencimento}" required>
                        </div>
                        <div class="mb-3">
                            <label for="editReducao" class="form-label">Volume a reduzir por uso (ml)</label>
                            <input type="number" step="0.001" class="form-control" id="editReducao" value="${reagente.reducao}" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                    </form>
                `;
                
                reagenteModal.show();
                
                // Adiciona o evento de submit ao formulário de edição
                document.getElementById('editForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const novoNome = document.getElementById('editNome').value;
                    const novoVolume = parseFloat(document.getElementById('editVolume').value);
                    const novoVencimento = document.getElementById('editVencimento').value;
                    const novoReducao = parseFloat(document.getElementById('editReducao').value);
                    
                    // Validação para números decimais
                    if (isNaN(novoVolume) || isNaN(novoReducao)) {
                        alert("Por favor, insira valores numéricos válidos!");
                        return;
                    }
                    
                    // Formata para 3 casas decimais
                    const novoVolumeFormatado = parseFloat(novoVolume.toFixed(3));
                    const novoReducaoFormatada = parseFloat(novoReducao.toFixed(3));
                    
                    // Calcula a diferença de volume para ajustar o volume atual
                    const diferencaVolume = novoVolumeFormatado - reagente.volumeInicial;
                    const novoVolumeAtual = parseFloat((reagente.volume + diferencaVolume).toFixed(3));
                    
                    // Atualiza no Firebase
                    db.collection('reagentes').doc(id).update({
                        nome: novoNome,
                        volume: novoVolumeAtual,
                        volumeInicial: novoVolumeFormatado,
                        vencimento: novoVencimento,
                        reducao: novoReducaoFormatada
                    })
                    .then(() => {
                        alert('Reagente atualizado com sucesso!');
                        reagenteModal.hide();
                        carregarReagentes();
                    })
                    .catch(error => {
                        console.error('Erro ao atualizar reagente: ', error);
                        alert('Erro ao atualizar reagente. Por favor, tente novamente.');
                    });
                });
            }
        })
        .catch(error => {
            console.error('Erro ao buscar reagente: ', error);
        });
    }
    
    // Exclui um reagente
    function excluirReagente(id) {
        db.collection('reagentes').doc(id).delete()
        .then(() => {
            alert('Reagente excluído com sucesso!');
            carregarReagentes();
        })
        .catch(error => {
            console.error('Erro ao excluir reagente: ', error);
            alert('Erro ao excluir reagente. Por favor, tente novamente.');
        });
    }
    
    // Verifica se há um parâmetro de uso na URL (quando o QR code é escaneado)
    const urlParams = new URLSearchParams(window.location.search);
    const useParam = urlParams.get('use');
    
    if (useParam) {
        // Reduz o volume do reagente com precisão decimal
        db.collection('reagentes').doc(useParam).get()
        .then(doc => {
            if (doc.exists) {
                const reagente = doc.data();
                const novoVolume = parseFloat((reagente.volume - reagente.reducao).toFixed(3));
                
                if (novoVolume >= 0) {
                    db.collection('reagentes').doc(useParam).update({
                        volume: novoVolume
                    })
                    .then(() => {
                        alert(`Uso de ${reagente.reducao.toFixed(3)} ml registrado para ${reagente.nome}. Volume restante: ${novoVolume.toFixed(3)} ml`);
                        // Remove o parâmetro da URL sem recarregar a página
                        window.history.replaceState({}, document.title, window.location.pathname);
                    })
                    .catch(error => {
                        console.error('Erro ao atualizar volume: ', error);
                    });
                } else {
                    alert('Volume insuficiente para uso!');
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        })
        .catch(error => {
            console.error('Erro ao buscar reagente: ', error);
        });
    }
});