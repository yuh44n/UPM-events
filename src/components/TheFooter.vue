<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <router-link to="/" class="navbar__logo">
          UPM <span>Events</span>
        </router-link>
        <p>Plateforme centralisée pour la vie du campus de l'Université Privée de Marrakech. Vivez l'expérience UPM.</p>
      </div>

      <div class="footer__links">
        <h6>Navigation</h6>
        <ul>
          <li><router-link to="/">Dashboard</router-link></li>
          <li><router-link to="/polls">Boîte à Idées</router-link></li>
        </ul>
      </div>
    </div>

    <div class="container footer__bottom text-center">
      <p>&copy; 2026 UPM Events. Tous droits réservés.</p>
    </div>
  </footer>
</template>
