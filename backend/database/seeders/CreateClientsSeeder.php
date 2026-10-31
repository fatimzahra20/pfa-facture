<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CreateClientsSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            ['nom' => 'Mohamed Alaoui', 'email' => 'alaoui.mohamed@gmail.com', 'tel' => '+212612345678', 'adresse' => 'Casablanca, Maroc'],
            ['nom' => 'Fatima Bennani', 'email' => 'bennani.fatima@gmail.com', 'tel' => '+212723456789', 'adresse' => 'Rabat, Maroc'],
            ['nom' => 'Hassan Ben Abdelkader', 'email' => 'hassan.ben@gmail.com', 'tel' => '+212634567890', 'adresse' => 'Fes, Maroc'],
            ['nom' => 'Aicha Moussaoui', 'email' => 'moussaoui.aicha@gmail.com', 'tel' => '+212745678901', 'adresse' => 'Marrakech, Maroc'],
            ['nom' => 'Karim Bennani', 'email' => 'karim.bennani@gmail.com', 'tel' => '+212656789012', 'adresse' => 'Tanger, Maroc'],
            ['nom' => 'Leila Sadiki', 'email' => 'sadiki.leila@gmail.com', 'tel' => '+212667890123', 'adresse' => 'Meknes, Maroc'],
            ['nom' => 'Youssef Akkari', 'email' => 'akkari.youssef@gmail.com', 'tel' => '+212678901234', 'adresse' => 'Agadir, Maroc'],
            ['nom' => 'Noor El Houda', 'email' => 'noor.elhouda@gmail.com', 'tel' => '+212689012345', 'adresse' => 'Oujda, Maroc'],
            ['nom' => 'Ahmad Bennani', 'email' => 'ahmad.bennani@gmail.com', 'tel' => '+212690123456', 'adresse' => 'Casablanca, Maroc'],
            ['nom' => 'Yasmine Bensaid', 'email' => 'bensaid.yasmine@gmail.com', 'tel' => '+212701234567', 'adresse' => 'Rabat, Maroc'],
            ['nom' => 'Omar Farah', 'email' => 'farah.omar@gmail.com', 'tel' => '+212612348765', 'adresse' => 'Fes, Maroc'],
            ['nom' => 'Jalila Karim', 'email' => 'karim.jalila@gmail.com', 'tel' => '+212723459876', 'adresse' => 'Marrakech, Maroc'],
            ['nom' => 'Abdel Hamid', 'email' => 'hamid.abdel@gmail.com', 'tel' => '+212634560987', 'adresse' => 'Tanger, Maroc'],
            ['nom' => 'Zohra Lahmidi', 'email' => 'lahmidi.zohra@gmail.com', 'tel' => '+212745671098', 'adresse' => 'Meknes, Maroc'],
            ['nom' => 'Samir Bennani', 'email' => 'bennani.samir@gmail.com', 'tel' => '+212656782109', 'adresse' => 'Agadir, Maroc'],
            ['nom' => 'Hana Tabet', 'email' => 'tabet.hana@gmail.com', 'tel' => '+212667893210', 'adresse' => 'Oujda, Maroc'],
            ['nom' => 'Rashid Zaalouni', 'email' => 'zaalouni.rashid@gmail.com', 'tel' => '+212678904321', 'adresse' => 'Casablanca, Maroc'],
            ['nom' => 'Maya Safir', 'email' => 'safir.maya@gmail.com', 'tel' => '+212689015432', 'adresse' => 'Rabat, Maroc'],
            ['nom' => 'Malik Serhani', 'email' => 'serhani.malik@gmail.com', 'tel' => '+212690126543', 'adresse' => 'Fes, Maroc'],
            ['nom' => 'Amina El Hajj', 'email' => 'elhajj.amina@gmail.com', 'tel' => '+212701237654', 'adresse' => 'Marrakech, Maroc'],
            ['nom' => 'Tariq Bennani', 'email' => 'bennani.tariq@gmail.com', 'tel' => '+212612349876', 'adresse' => 'Tanger, Maroc'],
            ['nom' => 'Samira Elmi', 'email' => 'elmi.samira@gmail.com', 'tel' => '+212723460987', 'adresse' => 'Meknes, Maroc'],
            ['nom' => 'Ibrahim Smail', 'email' => 'smail.ibrahim@gmail.com', 'tel' => '+212634571098', 'adresse' => 'Agadir, Maroc'],
            ['nom' => 'Rania Zaki', 'email' => 'zaki.rania@gmail.com', 'tel' => '+212745682109', 'adresse' => 'Oujda, Maroc'],
            ['nom' => 'Anwar Benzekri', 'email' => 'benzekri.anwar@gmail.com', 'tel' => '+212656793210', 'adresse' => 'Casablanca, Maroc'],
            ['nom' => 'Lina Mahjoubi', 'email' => 'mahjoubi.lina@gmail.com', 'tel' => '+212667804321', 'adresse' => 'Rabat, Maroc'],
            ['nom' => 'Jamal Bennani', 'email' => 'bennani.jamal@gmail.com', 'tel' => '+212678915432', 'adresse' => 'Fes, Maroc'],
            ['nom' => 'Wafa Karim', 'email' => 'karim.wafa@gmail.com', 'tel' => '+212689026543', 'adresse' => 'Marrakech, Maroc'],
            ['nom' => 'Nabil Chami', 'email' => 'chami.nabil@gmail.com', 'tel' => '+212690137654', 'adresse' => 'Tanger, Maroc'],
            ['nom' => 'Dina Baraka', 'email' => 'baraka.dina@gmail.com', 'tel' => '+212701248765', 'adresse' => 'Meknes, Maroc'],
            ['nom' => 'Faisal Bennani', 'email' => 'bennani.faisal@gmail.com', 'tel' => '+212612350987', 'adresse' => 'Agadir, Maroc'],
            ['nom' => 'Salma Tanji', 'email' => 'tanji.salma@gmail.com', 'tel' => '+212723461098', 'adresse' => 'Oujda, Maroc'],
            ['nom' => 'Khalid Mzali', 'email' => 'mzali.khalid@gmail.com', 'tel' => '+212634572109', 'adresse' => 'Casablanca, Maroc'],
            ['nom' => 'Nadia Hajj', 'email' => 'hajj.nadia@gmail.com', 'tel' => '+212745693210', 'adresse' => 'Rabat, Maroc'],
            ['nom' => 'Saeed Bennani', 'email' => 'bennani.saeed@gmail.com', 'tel' => '+212656704321', 'adresse' => 'Fes, Maroc'],
            ['nom' => 'Hiba Farhani', 'email' => 'farhani.hiba@gmail.com', 'tel' => '+212667815432', 'adresse' => 'Marrakech, Maroc'],
            ['nom' => 'Rachid Elmi', 'email' => 'elmi.rachid@gmail.com', 'tel' => '+212678926543', 'adresse' => 'Tanger, Maroc'],
            ['nom' => 'Layla Karim', 'email' => 'karim.layla@gmail.com', 'tel' => '+212689037654', 'adresse' => 'Meknes, Maroc'],
            ['nom' => 'Waleed Serhani', 'email' => 'serhani.waleed@gmail.com', 'tel' => '+212690148765', 'adresse' => 'Agadir, Maroc'],
            ['nom' => 'Rana Safir', 'email' => 'safir.rana@gmail.com', 'tel' => '+212701259876', 'adresse' => 'Oujda, Maroc'],
            ['nom' => 'Bilal Bennani', 'email' => 'bennani.bilal@gmail.com', 'tel' => '+212612361098', 'adresse' => 'Casablanca, Maroc'],
            ['nom' => 'Zahra Tabet', 'email' => 'tabet.zahra@gmail.com', 'tel' => '+212723472109', 'adresse' => 'Rabat, Maroc'],
            ['nom' => 'Amir Zaalouni', 'email' => 'zaalouni.amir@gmail.com', 'tel' => '+212634583210', 'adresse' => 'Fes, Maroc'],
            ['nom' => 'Hind Zaki', 'email' => 'zaki.hind@gmail.com', 'tel' => '+212745704321', 'adresse' => 'Marrakech, Maroc'],
            ['nom' => 'Majid Bennani', 'email' => 'bennani.majid@gmail.com', 'tel' => '+212656815432', 'adresse' => 'Tanger, Maroc'],
            ['nom' => 'Iman Elhouda', 'email' => 'elhouda.iman@gmail.com', 'tel' => '+212667926543', 'adresse' => 'Meknes, Maroc'],
            ['nom' => 'Zakariah Akkari', 'email' => 'akkari.zakariah@gmail.com', 'tel' => '+212678037654', 'adresse' => 'Agadir, Maroc'],
            ['nom' => 'Laila Mahjoubi', 'email' => 'mahjoubi.laila@gmail.com', 'tel' => '+212689148765', 'adresse' => 'Oujda, Maroc'],
            ['nom' => 'Wassim Bennani', 'email' => 'bennani.wassim@gmail.com', 'tel' => '+212690259876', 'adresse' => 'Casablanca, Maroc'],
            ['nom' => 'Alyssa Chami', 'email' => 'chami.alyssa@gmail.com', 'tel' => '+212701360987', 'adresse' => 'Rabat, Maroc'],
            ['nom' => 'Yazid Bennani', 'email' => 'bennani.yazid@gmail.com', 'tel' => '+212612372098', 'adresse' => 'Fes, Maroc'],
        ];

        DB::table('clients')->insert($clients);
    }
}
