import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderMenus } from 'src/app/Models/header-menus.dto';
import { UserDTO } from 'src/app/Models/user.dto';
import { HeaderMenusService } from 'src/app/Services/header-menus.service';
import { SharedService } from 'src/app/Services/shared.service';
import { UserService } from 'src/app/Services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  // TO DO 16
  registerUser: UserDTO;

  name!: FormControl;
  surname_1!: FormControl;
  surname_2!: FormControl;
  alias!: FormControl;
  birth_date!: FormControl;
  email!: FormControl;
  password!: FormControl;
  registerForm: FormGroup;
  isValidForm: boolean | null;
  valorMensaje:string="";

  constructor(
    private formBuilder: UntypedFormBuilder,
    private userService: UserService,
    private sharedService: SharedService,
    private headerMenusService: HeaderMenusService,
    private router: Router
  ) {

    // TO DO 17
    this.registerUser = new UserDTO("", "", "", "", new Date(), "", "");
    this.isValidForm = null;
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
      surname_1: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
      surname_2: ['', [Validators.minLength(5), Validators.maxLength(25)]],
      alias: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
      birth_date: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]]

    })
  



  }

  ngOnInit(): void { }

  

  async register(): Promise<void> {
    
    let responseOK: boolean = false;
    this.isValidForm = false;
    let errorResponse: any;

    if (this.registerForm.invalid) {
      return;
    }

    this.isValidForm = true;
    this.registerUser = this.registerForm.value;

    try {
      await this.userService.register(this.registerUser);
      responseOK = true;
    } catch (error: any) {
      responseOK = false;
      errorResponse = error.error;

      const headerInfo: HeaderMenus = {
        showAuthSection: false,
        showNoAuthSection: true,
      };
      this.headerMenusService.headerManagement.next(headerInfo);

      this.sharedService.errorLog(errorResponse);
    }

    await this.sharedService.managementToast(
      'registerFeedback',
      responseOK,
      errorResponse
    );

    if (responseOK) {
      // Reset the form
      this.registerForm.reset();
      // After reset form we set birthDate to today again (is an example)
      this.birth_date.setValue(formatDate(new Date(), 'yyyy-MM-dd', 'en'));
      this.router.navigateByUrl('home');
    }
    console.log(this.isValidForm)
  }
  
  }

