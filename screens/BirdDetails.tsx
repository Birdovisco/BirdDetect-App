import React, { useEffect, useRef } from "react";
import {
    View,
    Image,
    Text,
    TouchableOpacity,
} from "react-native";
import { theme } from "../core/theme";
import { Audio } from "expo-av";
import FFT from "fft.js";
import Svg, { Rect } from 'react-native-svg';
import Ionicons from "react-native-vector-icons/Ionicons";

export default function BirdDetails({ route }) {
    const names = ['Skowronek', 'Krzyżówka', 'Gęś białoczelna', 'Gęś zbożowa',
        'Jerzyk', 'Mewa śmieszka', 'Gołąb miejski', 'Grzywacz', 'Gawron', 
        'Kawka', 'Kukułka', 'Modraszka', 'Oknówka', 'Łyska', 'Sójka',
        'Słowik szary', 'Słowik rdzawy', 'Sroka', 'Brzegówka', 'Kowalik'];
    const namesLatin = ['Alauda arvensis', 'Anas platyrhynchos', 'Anser albifrons',
        'Anser fabalis', 'Apus apus', 'Chroicocephalus ridibundus',
        'Columba livia forma urbana', 'Columba palumbus', 'Corvus frugilegus', 
        'Corvus monedula', 'Cuculus canorus', 'Cyanistes caeruleus', 'Delichon urbicum',
        'Fulica atra', 'Garrulus glandarius', 'Luscinia luscinia', 'Luscinia megarhynchos',
        'Pica pica', 'Riparia riparia', 'Sitta europaea'];
    const photos = [require('../assets/birdPhotos/skowronek.jpg'), 
        require('../assets/birdPhotos/krzyżówka.jpg'), 
        require('../assets/birdPhotos/gęś białoczelna.jpg'),
        require('../assets/birdPhotos/gęś zbożowa.jpg'),
        require('../assets/birdPhotos/jerzyk.jpg'),
        require('../assets/birdPhotos/mewa śmieszka.jpg'),
        require('../assets/birdPhotos/gołąb miejski.jpg'),
        require('../assets/birdPhotos/grzywacz.jpg'),
        require('../assets/birdPhotos/gawron.jpg'),
        require('../assets/birdPhotos/kawka.jpg'),
        require('../assets/birdPhotos/kukułka.jpg'),
        require('../assets/birdPhotos/modraszka.jpg'),
        require('../assets/birdPhotos/oknówka.jpg'),
        require('../assets/birdPhotos/łyska.jpg'),
        require('../assets/birdPhotos/sójka.jpg'),
        require('../assets/birdPhotos/słowik szary.jpg'),
        require('../assets/birdPhotos/słowik rdzawy.jpg'),
        require('../assets/birdPhotos/sroka.jpg'),
        require('../assets/birdPhotos/brzegówka.jpg'),
        require('../assets/birdPhotos/kowalik.jpg')];
    const descs = [
        "Jest jednym najbardziej znanych ptaków. Rozpoznawalność zawdzięcza powszechności występowania oraz donośnemu śpiewowi, który rozbrzmiewa niemal nad każdym polem przez całą wiosnę. Długość ciała skowronka to 18-19 cm. Skromnie ubarwiony ptak nieco większy od wróbla. Upierzenie brunatnoszare, ciemno plamkowane z wierzchu, spód białawy z kreskowaną piersią. Jego śpiew to przepiękna melodia złożona z wielu zawiłych zwrotek. Swoje granie rozpoczyna nie od razu po starcie z ziemi. Śpiew słychać dopiero na wysokości około 10-20 metrów. Wówczas zawisa w powietrzu, a następnie po wykonaniu całego repertuaru, jaki miał zaplanowany, wznosi się jeszcze wyżej i, co ciekawe, dalej śpiewa. Właśnie ta umiejętność, śpiewania na wdechu oraz wydechu, pozwala mu wznosić się nawet na 100 – 200 metrów.",
        "Gatunek dużego ptaka wodnego z rodziny kaczkowatych (Anatidae). Jest to najpospolitszy i najszerzej rozpowszechniony gatunek kaczki. Zasiedla większość półkuli północnej, ale została introdukowana do południowo-wschodniej Australii oraz na Nową Zelandię. Nie jest zagrożona. W Polsce gatunek łowny w okresie od 1 września do 31 grudnia. Od krzyżówki pochodzą kaczki domowe. W locie ujawniają się granatowe, biało obrzeżone na górze i krawędzi skrzydła lusterka. Poza tym obie płcie mają pomarańczowe nogi.",
        "Gatunek dużego, wędrownego ptaka wodnego z rodziny kaczkowatych (Anatidae), zamieszkujący północną Eurazję i Amerykę Północną. Przeloty w lutym–maju i wrześniu–grudniu. Zimuje w zachodniej i południowej Europie, południowo-zachodniej, południowej i wschodniej Azji, na zachodnich wybrzeżach i południu USA oraz w Meksyku. W Polsce pojawia się licznie podczas przelotów, na północy i zachodzie kraju; zimuje głównie na zachodzie kraju. Daje płodne mieszańce z gęsiami domowymi, np. gęsi pskowskie łyse (łyse – od białej plamy na czole).",
        "Gatunek dużego wędrownego ptaka wodnego z rodziny kaczkowatych (Anatidae). Zamieszkuje tundrę, lasotundrę i tajgę Eurazji. Zimuje plamowo w pasie od zachodniej Europy po Japonię. Nie jest zagrożony wyginięciem. Samiec i samica, a także osobniki młodociane ubarwione są jednakowo. Samce są jednak większe od samic. Ogólnie ubarwiona szarobrązowo, na grzbiecie i bokach poprzeczne jasne prążki. Podogonie i ogon biały. Łapy pomarańczowe, dziób czarny u nasady i na końcu z pomarańczowymi (ich wielkość zależy od podgatunku) plamami. W locie widać z przodu ciemnoszare skrzydła.",
        "Gatunek średniego ptaka wędrownego z rodziny jerzykowatych (Apodidae). Zamieszkuje niemal całą Europę, dużą część Azji oraz północną Afrykę. Zimuje w południowej połowie Afryki. W Polsce średnio liczny ptak lęgowy, miejscami liczny. Występuje na terenie całego kraju – najliczniej w dużych miastach. W niektórych częściach kraju, głównie na wschodzie Polski oraz na Mazurach, gnieździ się też w starych lasach (Puszcza Knyszyńska, Puszcza Białowieska, Puszcza Augustowska, Wielkopolski Park Narodowy), a na południu – w skalistych partiach gór: Tatr, Karkonoszy i Gór Bystrzyckich oraz w Ojcowskim Parku Narodowym.",
        "Gatunek średniego, wędrownego ptaka wodnego z rodziny mewowatych (Laridae). To najpowszechniejsza z małych mew. We wszystkich szatach widać biały klin na przednim końcu dłoni. Samiec i samica ubarwione jednakowo. W szacie godowej od marca do sierpnia, a nawet listopada, łatwa do rozpoznania – głowa brązowoczarna, szyja, spód ciała i ogon białe, a grzbiet i skrzydła popielate. Końce lotek czarne, a nogi i dziób czerwone. Wokół oczu mały, wąski, biały pasek, przerwany z przodu.",
        "Gatunek synantropijny wywodzący się od udomowionego gołębia skalnego (Columba livia). Populacja gołębia miejskiego składa się z osobników zbiegłych z hodowli, które przystosowały się do życia w miastach i zabudowaniach. W Polsce jest objęty częściową ochroną gatunkową. Żywi się nasionami i odpadkami, bywa też dokarmiany przez ludzi. Liczebność gołębi miejskich w Polsce wynosi około 100–250 tysięcy par.",
        "Gatunek średniej wielkości ptaka wędrownego z rodziny gołębiowatych (Columbidae), największy spośród gatunków gołębi występujących w Polsce. To największy przedstawiciel gołębiowatych w Polsce. Grzywacze to duże gołębie o zaokrąglonej sylwetce i wydatnej piersi. Upierzenie w większości niebieskoszare. Głowa niebieskoszara, na karku widoczna zielono-fioletowa opalizacja. Pióra po bokach szyi ułożone są pasami, co daje wrażenie rowków między rzędami piór; to cecha właściwa wielu ptakom z rodzaju Columba.",
        "Gatunek dużej wielkości ptaka synantropijnego z rodziny krukowatych (Corvidae), zamieszkujący Eurazję. Nie jest zagrożony. Zasiedlił prawie całą Europę, prócz Półwyspu Iberyjskiego, Islandii, północnej Skandynawii i północnej Rosji. Dalej jego areał ciągnie się przez Azję po wybrzeża Oceanu Spokojnego. Populacje z chłodniejszych regionów wykonują regularne migracje na południe – do Środkowej i Zachodniej Europy, najdalej dolatując nad Morze Śródziemne.",
        "Gatunek średniej wielkości ptaka synantropijnego z rodziny krukowatych (Corvidae), blisko spokrewniony z kawką srokatą. Zamieszkuje Eurazję i północno-zachodnią Afrykę. W Polsce średnio liczny ptak lęgowy niżu. Ptak wielkości gołębia, mniejszy niż jakikolwiek gatunek z rodzaju Corvus, do którego kawka jest zaliczana. Obie płcie ubarwione jednakowo. Upierzenie czarne, a boki szyi, głowy i karku łupkowoszare. Na głowie czarna „czapka”. U ptaków młodych tęczówki są brązowawe, u dorosłych zmieniają barwę na srebrzysto-błękitną.",
        "Gatunek średniego ptaka wędrownego z podrodziny kukułek (Cuculinae) w rodzinie kukułkowatych (Cuculidae). Jedyny w Europie Środkowej pasożyt lęgowy. Zamieszkuje strefę umiarkowaną i zalesioną część Eurazji i Afrykę – od zachodniej Europy i północnej Afryki aż po Kamczatkę i Japonię. W Azji spotykana również na południe od krawędzi strefy tropikalnej. W Europie omija tylko Islandię. W Polsce średnio liczny, ptak lęgowy. Spotkać i usłyszeć można ją na całym niżowym obszarze Polski i w różnych typach krajobrazów – w lasach, zadrzewieniach, na mozaikowo porośniętych drzewami i krzewami terenach rolniczych, ale i w pobliżu trzcinowisk wokół zbiorników wodnych.",
        "Gatunek małego, częściowo wędrownego ptaka z rodziny sikor, zamieszkującego całą Europę z wyjątkiem północnej części Skandynawii i północnej Rosji, a także część zachodniej Azji. Przebywa we wszystkich rodzajach lasów, a także parkach, ogrodach i sadach. Nie jest zagrożona wyginięciem, a w większości krajów jest nawet liczna. Łatwo rozpoznawalny ptak o krępej sylwetce i dużej głowie z bardzo krótkim dziobem, przystosowanym do kucia w spróchniałym drewnie, dłubania w korze oraz rozdziobywania nasion i zbierania owadów z liści i kory.",
        "Niewielki gatunek ptaka wędrownego z rodziny jaskółkowatych (Hirundinidae). Rozmnaża się w Europie, zachodniej i środkowej Azji oraz północnej Afryce, a zimuje w Afryce Subsaharyjskiej oraz południowej i południowo-zachodniej Azji. Żywi się owadami, które złapie w locie. Migruje na obszary, gdzie insekty latające występują obficie. Głowę i wyższe partie ciała ma czarne z niebieskim połyskiem, biały kuper i dolne partie ciała. Występuje zarówno na otwartych terenach, jak i w pobliżu siedzib ludzkich. Z wyglądu jest podobny do dwóch innych gatunków z rodzaju Delichon, które są endemiczne dla wschodniej i południowej Azji. Posiada dwa powszechnie uznawane podgatunki.",
        "Gatunek średniej wielkości ptaka wodnego z rodziny chruścieli (Rallidae). W zachodniej i południowej części zasięgu osiadły i koczujący, północne populacje migrują jesienią na południe lub południowy zachód. Nie jest zagrożony wyginięciem. Brak dymorfizmu płciowego, choć samce są nieco większe od samic. Upierzenie dorosłych łupkowoczarne z nagą, podobnie jak dziób, białą blaszką rogową na czole, od której pochodzi polska nazwa gatunku. Palce otoczone karbowanymi płatkami skórnymi, łuski na nogach zielonosiwej barwy. Młode jaśniejsze z mniejszą i ciemną blaszką na czole, jasnoszarą szyją i piersią, czarnoszarym grzbietem, pisklęta ciemne z żółtą głową, białą brwią, czerwoną plamą na czole, o dziobie czerwonym u nasady, a reszcie białej z czarną kropką na końcu.",
        "Gatunek średniej wielkości ptaka z rodziny krukowatych (Corvidae), zamieszkujący Eurazję i północno-zachodnią Afrykę. Nie jest zagrożony. Zamieszkuje niemal całą Eurazję i północno-zachodnią Afrykę. W Europie areał na północy kończy się w okolicach koła podbiegunowego. Gatunek częściowo osiadły; populacje z północy i wschodu podejmują czasami dalsze wędrówki na południowy zachód; mogą wtedy tworzyć wielkie, choć często luźne stada, liczące kilkaset do tysiąca osobników. W Polsce rozpowszechniony w całym kraju, liczny ptak lęgowy.",
        "Gatunek małego ptaka śpiewającego z rodziny muchołówkowatych (Muscicapidae). Ptaki z tej grupy są najznakomitszymi śpiewakami. Śpiew ich jest donośny, niezwykle urozmaicony, o dużej skali tonów. Słowik przylatuje na tereny Polski w kwietniu-maju, a odlatuje do Afryki w sierpniu-wrześniu. Zamieszkuje południową część Półwyspu Skandynawskiego, Europę wschodnią i część środkowej. Zimuje w południowo-wschodniej Afryce. W Polsce to średnio liczny ptak lęgowy. Przez kraj przebiega zachodnia linia zasięgu tego gatunku. Brak wyraźnego dymorfizmu płciowego.",
        "Gatunek małego wędrownego ptaka z rodziny muchołówkowatych (Muscicapidae). Zasiedla Europę kontynentalną na zachód od linii Wisły i Ukrainy – zachodnią i południową, a oprócz tego Bliski Wschód (zwłaszcza Azję Mniejszą), Kaukaz, Azję Środkową i północno-zachodnią Afrykę. Słowik rdzawy nie jest spotykany w północno-zachodniej Europie, Skandynawii i w większości wschodniej Europy. Nieco większy i smuklejszy od wróbla. Mimo pięknego śpiewu słowiki są dość skromnie upierzone w barwy zeschłych liści. Mają brązowe upierzenie z ciemnorudym ogonem i kuprem. Obie płcie ubarwione podobnie.",
        "Gatunek średniej wielkości ptaka z rodziny krukowatych (Corvidae), zamieszkujący Eurazję. Nie jest zagrożony. Zamieszkuje całą Europę, dużą część Azji . Izolowana populacja występuje na Kamczatce w Rosji. W Polsce szeroko rozpowszechniony, jeden z najlepiej znanych ptaków, dość częsty ptak lęgowy na nizinach. Najbardziej powszechna na ziemi lubuskiej i w środkowej części Małopolski. Najrzadziej spotykana na Mazurach – tu mała liczebność srok związana jest z dużą lesistością obszarów. Ptak o smukłej sylwetce z długim ogonem i charakterystycznym czarno-białym upierzeniu. Obie płci ubarwione jednakowo, ale samiec jest zwykle nieco większy i cięższy od samicy, ma dłuższy ogon. Bardzo długi, zaostrzony ogon z piórami o stopniowanej długości.",
        "Gatunek niewielkiego ptaka wędrownego z rodziny jaskółkowatych (Hirundinidae). Zamieszkuje niemal całą Eurazję, Maghreb i dolinę Nilu w północnej Afryce oraz Amerykę Północną. Przeloty w kwietniu-maju i sierpniu-wrześniu. Wędruje na duże dystanse. Zimuje w Afryce na południe od Sahary, Indiach, w Azji Południowo-Wschodniej oraz Ameryce Południowej. W Polsce średnio liczny ptak lęgowy niżu, lokalnie może być liczny lub przeciwnie – nieliczny. To najmniejsza z polskich jaskółek (mniejsza od wróbla). Spotkać można ją w większości kraju, choć występuje nierównomiernie, a w górach nie pojawia się na terenach położonych wyżej niż 600 m n.p.m.",
        "Gatunek niewielkiego, osiadłego ptaka z rodziny kowalików (Sittidae), zamieszkujący Eurazję oraz północno-zachodnią Afrykę. Nie jest zagrożony. Zamieszkuje licznie lasy Europy, Maghreb, Azję Mniejszą i znaczną część umiarkowanej Azji do Pacyfiku i granicy tropików. W Polsce szeroko rozpowszechniony, średnio liczny ptak lęgowy. Ptak wielkości wróbla. Krępa sylwetka ze stosunkowo dużą głową, krótkim ogonem i mocnym, dłutowatym dziobem podobnym do dzioba dzięciołów. Obie płci podobnych rozmiarów, ubarwione prawie jednakowo, choć samiec w porównaniu z samicą ma bardziej rdzawy spód ciała i ciemnokasztanowe boki ciała z wiśniowym odcieniem."
    ];

    const [savedRecording] = React.useState<Audio.Recording>(route.params.rec);
    const label = route.params.lab;
    const sound = useRef(new Audio.Sound());
    const [birdName, setBirdName] = React.useState<String>("error");
    const [birdNameLatin, setBirdNameLatin] = React.useState<String>("error");
    const [birdPhoto, setBirdPhoto] = React.useState<NodeRequire>(require('../assets/birdPhotos/birdImage.jpg'));
    const [birdDesc, setBirdDesc] = React.useState<String>("error");

    useEffect(() => {
        console.log(route);

        const loadRecording = async () => {
            try {
              await sound.current.loadAsync({ uri: savedRecording.getURI() });
            } catch (error) {
              console.error("Error loading recording:", error);
            }
        };

        loadRecording();
        getBirdData(label);
    }, [savedRecording]);

    const getBirdData = (index) => {
        setBirdName(names[index]);
        setBirdNameLatin(namesLatin[index]);
        setBirdPhoto(photos[index]);
        setBirdDesc(descs[index]);
    };

    const processAudioData = (audioData) => {
        const fft = new FFT(1024); // FFT size
        const out = fft.createComplexArray();
        const data = new Float32Array(audioData);
      
        fft.realTransform(out, data);
        fft.completeSpectrum(out);
      
        console.log(out);
        return out;
    };

    const spectrogram = (data) => {
        const barWidth = 2;
        const barSpacing = 1;
        const height = 200;
      
        return (
          <View>
            <Svg height={height} width={data.length * (barWidth + barSpacing)}>
              {data.map((value, index) => (
                <Rect
                  key={index}
                  x={index * (barWidth + barSpacing)}
                  y={height - (value / 255) * height}
                  width={barWidth}
                  height={(value / 255) * height}
                />
              ))}
            </Svg>
          </View>
        );
    };

    const playSound = async () => {
        try {
            await sound.current.playAsync();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.colors.primary }}>
            <View className="items-center">
                <View className="w-64 h-64 rounded-full overflow-hidden border-4 border-black z-10">
                    <Image source={birdPhoto} className="w-full h-full" />
                </View>
            </View>
            <View className="flex-1 bg-white p-5 items-center -mt-16 pt-24">
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text className="text-2xl font-bold text-center mb-1">{birdName}</Text>
                    <TouchableOpacity onPress={playSound} className='ml-2'>
                        <Ionicons name="play-circle" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <Text className="text-lg italic text-center mb-5">{birdNameLatin}</Text>
                <Text className="text-base text-center leading-6">{birdDesc}</Text>
            </View>
        </View>
    );
};
