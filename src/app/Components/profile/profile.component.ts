import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { UserDTO } from 'src/app/Models/user.dto';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { SharedService } from 'src/app/Services/shared.service';
import { UserService } from 'src/app/Services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  
  // TO DO 4
  profileUser: UserDTO;

  name!: FormControl;
  surname_1!: FormControl;
  surname_2!: FormControl;
  alias!: FormControl;
  birth_date!: FormControl;
  email!: FormControl;
  password!: FormControl;

  profileForm: FormGroup;
  isValidForm: boolean | null;
  

  constructor(
    private formBuilder: UntypedFormBuilder,
    private userService: UserService,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService


  ) {
    // TO DO 5
    this.profileUser = new UserDTO("", "", "", "", new Date(), "", "");
    this.isValidForm = null;
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
      alias: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
      email: ['', [Validators.required, Validators.email]],
      birth_date: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      surname_1: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
      surname_2: ['', [Validators.minLength(5), Validators.maxLength(25)]],
    });
  }
  async ngOnInit(): Promise<void> {
    
    let errorResponse: any;

    // load user data
    const userId = this.localStorageService.get('user_id');
    if (userId) {
      try {
        const userData = await this.userService.getUSerById(userId);

        this.name.setValue(userData.name);
        this.surname_1.setValue(userData.surname_1);
        this.surname_2.setValue(userData.surname_2);
        this.alias.setValue(userData.alias);
        this.birth_date.setValue(
          formatDate(userData.birth_date, 'yyyy-MM-dd', 'en')
        );
        this.email.setValue(userData.email);

        this.profileForm = this.formBuilder.group({
          name: this.name,
          surname_1: this.surname_1,
          surname_2: this.surname_2,
          alias: this.alias,
          birth_date: this.birth_date,
          email: this.email,
          password: this.password,
        });
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
    
  }

  async updateUser(): Promise<void> {
    
    let responseOK: boolean = false;
    this.isValidForm = false;
    let errorResponse: any;

    if (this.profileForm.invalid) {
      return;
    }

    this.isValidForm = true;
    this.profileUser = this.profileForm.value;

    const userId = this.localStorageService.get('user_id');

    if (userId) {
      try {
        await this.userService.updateUser(userId, this.profileUser);
        responseOK = true;
      } catch (error: any) {
        responseOK = false;
        errorResponse = error.error;

        this.sharedService.errorLog(errorResponse);
      }
    }

    await this.sharedService.managementToast(
      'profileFeedback',
      responseOK,
      errorResponse
    );
    
  }
}
