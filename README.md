# Sistema de Controle de Estoque de Reagentes com QR Code

![Screenshot](assets/screenshot.png) *(adicione uma imagem do sistema em funcionamento)*

Sistema web para gerenciamento de estoque de reagentes laboratoriais com geração de QR codes para registro de uso, desenvolvido para funcionar em GitHub Pages com Firebase como backend.

## Funcionalidades Principais

✔ **Cadastro de Reagentes**  
   - Nome, volume total, data de vencimento e volume de redução por uso  

✔ **Controle de Estoque em Tempo Real**  
   - Visualização do volume atual e histórico  

✔ **Sistema de QR Codes**  
   - Geração automática para cada reagente  
   - Redução do volume ao escanear  

✔ **Gestão Completa**  
   - Edição de informações  
   - Exclusão de registros  
   - Destaque para itens vencidos  

✔ **Acesso Multiplataforma**  
   - Responsivo para desktop e mobile  

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)  
- **UI**: Bootstrap 5  
- **QR Code**: Biblioteca qrcode-generator  
- **Backend**: Firebase (Firestore Database)  
- **Hospedagem**: GitHub Pages  

## Como Implementar

### Pré-requisitos
1. Conta no [Firebase](https://firebase.google.com/)
2. Conta no [GitHub](https://github.com/)
3. Navegador moderno (Chrome, Firefox, Edge)

### Passo a Passo

1. **Configurar o Firebase**:
   ```bash
   - Crie um projeto em console.firebase.google.com
   - Ative o Firestore Database (modo produção)
   - Registre um app web e obtenha as credenciais