# Price Monitor

## 📌 Visão Geral

Este projeto consiste em uma aplicação web fullstack desenvolvida para monitoramento de preços de produtos de hardware (processadores, placas de vídeo, placas-mãe, memórias, etc.) em diferentes lojas online.

A plataforma permite que o usuário cadastre produtos a partir da URL da loja, defina um preço-alvo e acompanhe o histórico de variação de preços. Um scraper executado periodicamente consulta o preço atual de cada produto e, quando o valor cai até (ou abaixo) do preço-alvo definido, um alerta é enviado automaticamente via Telegram.

O projeto foi idealizado tanto como ferramenta prática para acompanhar promoções na montagem de um PC quanto como exercício de desenvolvimento fullstack com integração de scraping, persistência de dados e notificações automatizadas.

---

## 🎯 Objetivo

O principal objetivo do projeto é construir uma plataforma capaz de monitorar preços de hardware em múltiplas lojas de forma automatizada e notificar o usuário quando um bom negócio aparecer.

Além disso, o projeto busca:

- Aplicar conceitos de desenvolvimento fullstack (React + FastAPI)
- Integrar scraping de múltiplos sites, tanto via HTTP simples quanto via browser headless
- Trabalhar com persistência de dados em SQLite
- Estruturar um scraper agendado (cron) para checagem periódica de preços
- Implementar notificações automatizadas via Telegram Bot API
- Estruturar uma aplicação com deploy distribuído (frontend e backend em serviços diferentes)

---

## 🧠 Funcionalidades

- 📋 Cadastro de produtos a partir da URL da loja
- 🏷️ Categorização de produtos (processador, placa de vídeo, placa-mãe, memória RAM, SSD, fan, water cooler, gabinete, fonte, outros)
- 💰 Definição de preço-alvo por produto (opcional)
- 🔍 Consulta de preço em tempo real ao cadastrar um produto (o produto só é salvo se o preço for obtido com sucesso)
- 🔄 Atualização manual do preço de um produto a qualquer momento
- 📈 Histórico de variação de preços por produto
- 🔔 Alertas via Telegram quando o preço cruza o preço-alvo para baixo (sem repetir o aviso enquanto o preço permanecer abaixo)
- 🛒 Suporte a múltiplas lojas: **KaBuM**, **Pichau**, **Terabyte** e **Compras Paraguai**
- 🤖 Scraper agendado via cron, com checagem periódica de todos os produtos cadastrados
- 🖥️ Dashboard React exibindo produtos, último preço e indicador de queda de preço (`price_drop`)

---

## 🛠️ Tecnologias utilizadas

### Frontend

- React 18 (Vite)
- TailwindCSS
- Fetch API (cliente HTTP próprio em `services/api.js`)

### Backend

- FastAPI
- Python 3
- SQLite
- Playwright (scraping com browser headless — Pichau, Terabyte)
- Requests + BeautifulSoup (scraping HTTP — KaBuM, Compras Paraguai)
- python-dotenv

### Infraestrutura e Serviços

- AWS EC2 (backend, via systemd + Nginx)
- AWS CloudFront (HTTPS na frente do backend)
- AWS Amplify (frontend)
- Telegram Bot API (alertas de preço)
- cron (execução periódica do scraper)

---

## ⚙️ Como rodar o projeto

> O projeto já está disponível online no link abaixo:
> https://main.d247riyxvb4coj.amplifyapp.com/

> O frontend está hospedado no AWS Amplify e o backend em uma instância AWS EC2, exposto via Nginx + CloudFront.

> Caso queira executar localmente, siga os passos abaixo.

### 🔙 Backend (FastAPI)

```bash
cd backend

python3 -m venv ../venv

source ../venv/bin/activate   # Linux/Mac
# ou
..\venv\Scripts\activate       # Windows

pip install -r requirements.txt
playwright install chromium    # necessário para os parsers Pichau/Terabyte

cd ..
venv/bin/uvicorn backend.main:app --reload --port 8000
```

Servidor disponível em: http://127.0.0.1:8000

### 🔜 Frontend (React)

```bash
cd frontend

npm install
npm run dev
```

App disponível em: http://localhost:3000 (proxy `/api` → `http://localhost:8000`)

---

## 🔄 Fluxo de funcionamento

1. O usuário acessa o dashboard (React) e visualiza os produtos já cadastrados, com o último preço conhecido e histórico.

2. Para cadastrar um novo produto, o usuário informa:
   - Nome
   - URL da loja (KaBuM, Pichau, Terabyte ou Compras Paraguai)
   - Categoria
   - Preço-alvo (opcional)

3. O backend:
   - Identifica a loja a partir da URL (`infer_site`)
   - Consulta o preço atual usando o parser correspondente (HTTP ou browser headless via Playwright)
   - Só salva o produto se o preço for obtido com sucesso

4. O produto e o primeiro registro de preço são armazenados no SQLite (`products` e `price_history`).

5. O usuário pode, a qualquer momento, forçar uma nova consulta de preço para um produto (`check-price`):
   - Se o preço mudou, uma nova entrada é registrada no histórico
   - Se o preço cruzou o preço-alvo para baixo, um alerta é enviado via Telegram

6. Periodicamente (cron, das 8h às 20h de 2 em 2h), o scraper roda automaticamente para **todos** os produtos cadastrados, repetindo a lógica de checagem de preço e disparo de alertas.

7. O dashboard exibe um indicador (`price_drop`) sempre que o preço atual de um produto está no preço-alvo ou abaixo dele.

8. O usuário pode consultar o histórico de preços de qualquer produto para visualizar a variação ao longo do tempo.

---

## ⏱️ Scraper / alertas

```bash
python -m backend.scraper
```

Para cada produto cadastrado:
1. Busca o preço atual com o parser correto (HTTP ou Playwright, conforme o site).
2. Se o preço mudou, registra em `price_history`.
3. Se o preço cruzou o `target_price` para baixo (e não estava abaixo antes), envia alerta no Telegram.

Logs em `backend/logs/scraper.log`.

---

## ⚠️ Limitações conhecidas

- **Pichau** e **Compras Paraguai** são protegidos por Cloudflare, que pode
  bloquear/desafiar requisições originadas de IPs de datacenter (ex: EC2/AWS),
  retornando erro ao consultar o preço mesmo com o parser correto. Para
  contornar isso em produção, é necessário rotear essas requisições por um
  proxy residencial.
- Não há suíte de testes ou linter configurados (backend ou frontend).
