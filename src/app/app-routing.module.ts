import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  {
    path: 'register',
    loadChildren: './pages/register/register.module#RegisterPageModule'
  },
  {
    path: 'shopping-lists',
    children: [
      {
        path: '',
        loadChildren:
          './pages/shopping-lists/shopping-lists.module#ShoppingListsPageModule'
      },
      {
        path: ':id',
        children: [
          {
            path: '',
            loadChildren: './pages/items/items.module#ItemsPageModule'
          },
          {
            path: 'items',
            children: [
              {
                path: 'add',
                loadChildren: './pages/items/add/add.module#AddPageModule'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: 'items/:id/edit',
    loadChildren: './pages/items/edit/edit.module#EditPageModule'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
