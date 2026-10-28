// Marca o <html> com a classe "js" antes da página aparecer (o CSS usa pra preparar as animações).
// Fica num arquivo à parte, sem "defer", porque a política de segurança (_headers) não deixa rodar script escrito dentro do HTML.
document.documentElement.classList.add('js');
