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
            path: 'share',
            loadChildren:
              './pages/shopping-lists/share/share.module#SharePageModule'
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
    path: 'itmes/:id/edit',
    loadChildren: './pages/items/edit/edit.module#EditPageModule'
  },
  {
    path: 'units',
    children: [
      {
        path: '',
        loadChildren: './pages/units/units.module#UnitsPageModule'
      },
      {
        path: 'add',
        loadChildren: './pages/units/add/add.module#AddPageModule'
      },
      {
        path: ':id/edit',
        loadChildren: './pages/units/edit/edit.module#EditPageModule'
      }
    ]
  },
  {
    path: 'products',
    children: [
      {
        path: '',
        loadChildren: './pages/products/products.module#ProductsPageModule'
      },
      {
        path: 'add',
        loadChildren: './pages/products/add/add.module#AddPageModule'
      },
      {
        path: ':id/edit',
        loadChildren: './pages/products/edit/edit.module#EditPageModule'
      }
    ]
  },
  {
    path: 'user',
    children: [
      {
        path: '',
        loadChildren: './pages/user/user.module#UserPageModule'
      },
      {
        path: 'edit',
        loadChildren: './pages/user/edit/edit.module#EditPageModule'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
